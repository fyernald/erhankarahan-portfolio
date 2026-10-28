import type { MediaKind } from "@/lib/uploads/types";

/** Serializable media shape shared by server components, client components and API responses. */
export type MediaItem = {
  id: string;
  kind: MediaKind;
  url: string;
  posterUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  blurDataUrl: string | null;
  originalName: string;
  alt: string;
  createdAt: string;
};
