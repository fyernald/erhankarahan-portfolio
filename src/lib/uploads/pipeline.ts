import "server-only";
import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { getDb } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getStorage } from "@/lib/storage/object-storage";
import { toMediaItem } from "@/features/media/mappers";
import type { MediaItem } from "@/features/media/types";
import { formatBytes } from "@/lib/utils/format";
import { verifyFileType } from "./detect";
import { UploadError } from "./errors";
import { maxBytesFor, maxBytesForAny } from "./limits";
import { STORAGE_FOLDERS } from "./policy";
import { processorFor } from "./processors";
import { receiveSingleFile } from "./receive";
import { createMalwareScanner } from "./scanners";
import { Semaphore } from "./semaphore";
import { TempFileRegistry } from "./temp-files";
import type { MediaKind, ProcessedAsset, VerifiedFile } from "./types";

const processingSlots = new Semaphore(2);

type UploadRequest = {
  request: Request;
  acceptedKinds: readonly MediaKind[];
  uploadedById: string;
};

/**
 * End-to-end upload flow. Nothing reaches object storage until every step passed:
 *
 *   receive (stream + size limit) → detect type from bytes → antivirus scan →
 *   sanitise (re-encode / remux / inspect) → store → persist metadata
 *
 * Temp files are always removed, and stored objects are rolled back if the
 * database insert fails.
 */
export async function handleUpload({ request, acceptedKinds, uploadedById }: UploadRequest): Promise<MediaItem> {
  const temp = new TempFileRegistry();
  try {
    const received = await receiveSingleFile(request, maxBytesForAny(acceptedKinds));
    temp.track(received.tempPath);

    const file = await verifyFileType(received, acceptedKinds);
    enforceKindLimit(file);
    await scanForMalware(file);

    const asset = await processingSlots.run(() => processorFor(file.kind).process(file, temp));
    return await persist(file, asset, uploadedById);
  } finally {
    await temp.cleanup();
  }
}

function enforceKindLimit(file: VerifiedFile) {
  const limit = maxBytesFor(file.kind);
  if (file.sizeBytes > limit) {
    throw new UploadError(`${file.kind} files are limited to ${formatBytes(limit)}.`, 413);
  }
}

async function scanForMalware(file: VerifiedFile) {
  const scanner = createMalwareScanner();
  let result;
  try {
    result = await scanner.scan(file.tempPath, file.sizeBytes);
  } catch (error) {
    console.error("[upload] malware scanner error", error);
    if (env().UPLOAD_REQUIRE_SCAN) throw new UploadError("The virus scanner is unavailable. Try again later.", 503);
    return;
  }

  if (result.status === "infected") {
    console.warn(`[upload] rejected infected file (${result.signature}) sha256=${file.sha256}`);
    throw new UploadError("The file was flagged as malicious and has been rejected.", 422);
  }
  // Large videos exceed clamd's stream limit; they are remuxed so only A/V streams survive.
  if (result.status === "skipped" && env().UPLOAD_REQUIRE_SCAN && file.kind !== "video") {
    throw new UploadError("The file could not be scanned for viruses.", 503);
  }
}

async function persist(file: VerifiedFile, asset: ProcessedAsset, uploadedById: string): Promise<MediaItem> {
  const storage = getStorage();
  const id = randomUUID();
  const storageKey = `${STORAGE_FOLDERS[file.kind]}/${id}.${asset.primary.extension}`;
  const posterKey = asset.poster ? `${STORAGE_FOLDERS.poster}/${id}.${asset.poster.extension}` : null;

  await storage.putFile({
    key: storageKey,
    filePath: asset.primary.path,
    contentType: asset.primary.contentType,
    contentDisposition: asset.contentDisposition,
  });
  if (asset.poster && posterKey) {
    await storage.putFile({ key: posterKey, filePath: asset.poster.path, contentType: asset.poster.contentType });
  }

  try {
    const storedSize = (await stat(asset.primary.path)).size;
    const [row] = await getDb()
      .insert(media)
      .values({
        id,
        kind: file.kind,
        storageKey,
        posterKey,
        mimeType: asset.primary.contentType,
        extension: asset.primary.extension,
        sizeBytes: storedSize,
        width: asset.width ?? null,
        height: asset.height ?? null,
        durationSeconds: asset.durationSeconds ?? null,
        blurDataUrl: asset.blurDataUrl ?? null,
        sha256: file.sha256,
        originalName: file.originalName,
        alt: "",
        uploadedById,
      })
      .returning();
    return toMediaItem(row);
  } catch (error) {
    await storage.deleteMany([storageKey, ...(posterKey ? [posterKey] : [])]).catch(() => undefined);
    throw error;
  }
}
