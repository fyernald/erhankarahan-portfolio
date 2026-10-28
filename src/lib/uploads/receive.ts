import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeWebReadableStream } from "node:stream/web";
import busboy from "busboy";
import { formatBytes } from "@/lib/utils/format";
import { UploadError } from "./errors";
import { uploadTempDir } from "./temp-files";
import type { ReceivedFile } from "./types";

const FILE_FIELD = "file";
const MAX_FILENAME_LENGTH = 180;

/** Removes path components, control characters and odd unicode from a client filename. */
export function sanitizeFilename(name: string): string {
  const base = path.basename(name.replace(/\\/g, "/"));
  const cleaned = base
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*‪-‮⁦-⁩]/g, "")
    .trim()
    .slice(-MAX_FILENAME_LENGTH);
  return cleaned || "upload";
}

/**
 * Streams the single `file` part of a multipart request straight to disk while
 * hashing it. The size limit is enforced *during* streaming so oversized bodies are
 * never fully buffered.
 */
export async function receiveSingleFile(request: Request, maxBytes: number): Promise<ReceivedFile> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data") || !request.body) {
    throw new UploadError("Expected a multipart/form-data upload.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes + 64 * 1024) {
    throw new UploadError(`File is too large. The limit is ${formatBytes(maxBytes)}.`, 413);
  }

  const tempPath = path.join(/*turbopackIgnore: true*/ await uploadTempDir(), `${randomUUID()}.upload`);

  try {
    return await parse(request, contentType, maxBytes, tempPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

function parse(request: Request, contentType: string, maxBytes: number, tempPath: string): Promise<ReceivedFile> {
  return new Promise<ReceivedFile>((resolve, reject) => {
    const parser = busboy({
      headers: { "content-type": contentType },
      limits: { files: 1, fileSize: maxBytes, fields: 4, fieldSize: 1024, parts: 5 },
    });

    let fileWrite: Promise<Omit<ReceivedFile, "tempPath">> | undefined;
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      source.destroy();
      reject(error instanceof UploadError ? error : new UploadError("The upload was interrupted.", 400));
    };

    parser.on("file", (fieldName, stream, info) => {
      if (fieldName !== FILE_FIELD || fileWrite) {
        stream.resume();
        return;
      }
      const hash = createHash("sha256");
      let size = 0;
      const meter = new Transform({
        transform(chunk: Buffer, _encoding, callback) {
          size += chunk.length;
          hash.update(chunk);
          callback(null, chunk);
        },
      });
      stream.on("limit", () => fail(new UploadError(`File is too large. The limit is ${formatBytes(maxBytes)}.`, 413)));

      fileWrite = pipeline(stream, meter, createWriteStream(tempPath, { flags: "wx", mode: 0o600 })).then(() => ({
        originalName: sanitizeFilename(info.filename ?? "upload"),
        sizeBytes: size,
        sha256: hash.digest("hex"),
      }));
      fileWrite.catch(fail);
    });

    parser.on("filesLimit", () => fail(new UploadError("Only one file can be uploaded per request.")));
    parser.on("partsLimit", () => fail(new UploadError("Too many form parts.")));
    parser.on("error", fail);
    parser.on("close", async () => {
      if (settled) return;
      if (!fileWrite) return fail(new UploadError("No file was provided."));
      try {
        const file = await fileWrite;
        if (settled) return;
        if (file.sizeBytes === 0) return fail(new UploadError("The file is empty."));
        settled = true;
        resolve({ ...file, tempPath });
      } catch (error) {
        fail(error);
      }
    });

    const source = Readable.fromWeb(request.body as unknown as NodeWebReadableStream);
    request.signal?.addEventListener("abort", () => fail(new UploadError("The upload was cancelled.", 499)));
    source.on("error", fail);
    source.pipe(parser);
  });
}
