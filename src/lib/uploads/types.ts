export type MediaKind = "image" | "video" | "document";

export const MEDIA_KINDS: readonly MediaKind[] = ["image", "video", "document"] as const;

/** A file that has been streamed to a private temp directory. */
export type ReceivedFile = {
  tempPath: string;
  originalName: string;
  sizeBytes: number;
  sha256: string;
};

/** A file whose real type was detected from its bytes and matched against the policy. */
export type VerifiedFile = ReceivedFile & {
  kind: MediaKind;
  mimeType: string;
  extension: string;
};

export type ProcessedFile = {
  path: string;
  contentType: string;
  extension: string;
};

/** Output of a processor: sanitised files ready to be stored. */
export type ProcessedAsset = {
  primary: ProcessedFile;
  poster?: ProcessedFile;
  width?: number;
  height?: number;
  durationSeconds?: number;
  blurDataUrl?: string;
  contentDisposition?: string;
};
