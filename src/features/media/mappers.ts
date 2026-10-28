import type { media } from "@/lib/db/schema";
import { mediaUrl } from "@/lib/media/urls";
import type { MediaItem } from "./types";

type MediaRow = typeof media.$inferSelect;

export function toMediaItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    kind: row.kind,
    url: mediaUrl(row.storageKey),
    posterUrl: mediaUrl(row.posterKey),
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    durationSeconds: row.durationSeconds,
    blurDataUrl: row.blurDataUrl,
    originalName: row.originalName,
    alt: row.alt,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toMediaItemOrNull(row: MediaRow | null | undefined): MediaItem | null {
  return row ? toMediaItem(row) : null;
}
