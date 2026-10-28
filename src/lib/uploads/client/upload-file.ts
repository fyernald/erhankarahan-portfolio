import type { MediaItem } from "@/features/media/types";
import type { MediaKind } from "@/lib/uploads/types";

export type UploadPhase = "uploading" | "processing";

type UploadOptions = {
  kinds?: readonly MediaKind[];
  onProgress?: (percent: number) => void;
  onPhaseChange?: (phase: UploadPhase) => void;
  signal?: AbortSignal;
};

export class UploadRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UploadRequestError";
  }
}

/**
 * Uploads one file to `/api/uploads`. Uses XMLHttpRequest because `fetch` cannot
 * report upload progress. Once all bytes are sent the server still scans and
 * re-encodes the file, which is surfaced as the `processing` phase.
 */
export function uploadFile(file: File, { kinds, onProgress, onPhaseChange, signal }: UploadOptions = {}): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const query = kinds?.length ? `?kinds=${kinds.join(",")}` : "";
    xhr.open("POST", `/api/uploads${query}`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.upload.onload = () => onPhaseChange?.("processing");

    xhr.onload = () => {
      const body = xhr.response as { item?: MediaItem; error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.item) resolve(body.item);
      else reject(new UploadRequestError(body?.error ?? "Upload failed", xhr.status));
    };
    xhr.onerror = () => reject(new UploadRequestError("Network error during upload", 0));
    xhr.onabort = () => reject(new UploadRequestError("Upload cancelled", 499));

    signal?.addEventListener("abort", () => xhr.abort());

    const form = new FormData();
    form.append("file", file);
    onPhaseChange?.("uploading");
    xhr.send(form);
  });
}
