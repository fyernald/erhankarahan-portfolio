import type { TempFileRegistry } from "../temp-files";
import type { MediaKind, ProcessedAsset, VerifiedFile } from "../types";

/**
 * A processor turns a verified upload into sanitised output files. Implementations
 * must never store the original bytes as-is when they can be rebuilt (re-encode,
 * remux), so any payload hidden in the original is discarded.
 */
export interface MediaProcessor {
  readonly kind: MediaKind;
  process(file: VerifiedFile, temp: TempFileRegistry): Promise<ProcessedAsset>;
}
