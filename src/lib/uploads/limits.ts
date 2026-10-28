import "server-only";
import { env } from "@/lib/env";
import type { MediaKind } from "./types";

export function maxBytesFor(kind: MediaKind): number {
  const config = env();
  switch (kind) {
    case "image":
      return config.UPLOAD_MAX_IMAGE_MB;
    case "video":
      return config.UPLOAD_MAX_VIDEO_MB;
    case "document":
      return config.UPLOAD_MAX_DOCUMENT_MB;
  }
}

export function maxBytesForAny(kinds: readonly MediaKind[]): number {
  return Math.max(...kinds.map(maxBytesFor));
}

/** Upper bound on image dimensions after processing (long edge, px). */
export const MAX_IMAGE_EDGE = 3840;
/** Decompression-bomb guard for images (total pixels). */
export const MAX_INPUT_PIXELS = 120_000_000;
export const MAX_VIDEO_SECONDS = 3 * 60 * 60;
