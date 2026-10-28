import "server-only";
import { inspectOfficeDocument } from "../inspectors/office";
import { inspectPdf } from "../inspectors/pdf";
import type { ProcessedAsset, VerifiedFile } from "../types";
import type { MediaProcessor } from "./processor";

/** RFC 6266 `attachment` header with an ASCII fallback and a UTF-8 filename. */
export function attachmentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/**
 * Documents can't be safely rebuilt, so they are inspected for active content and
 * always served as downloads (never rendered inline by the browser).
 */
export class DocumentProcessor implements MediaProcessor {
  readonly kind = "document" as const;

  async process(file: VerifiedFile): Promise<ProcessedAsset> {
    if (file.mimeType === "application/pdf") await inspectPdf(file.tempPath);
    else await inspectOfficeDocument(file.tempPath);

    return {
      primary: { path: file.tempPath, contentType: file.mimeType, extension: file.extension },
      contentDisposition: attachmentDisposition(file.originalName),
    };
  }
}
