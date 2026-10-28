import "server-only";
import sharp, { type OutputInfo, type Sharp } from "sharp";
import { UploadError } from "../errors";
import { MAX_IMAGE_EDGE, MAX_INPUT_PIXELS } from "../limits";
import type { TempFileRegistry } from "../temp-files";
import type { ProcessedAsset, VerifiedFile } from "../types";
import { createBlurDataUrl } from "./blur-placeholder";
import type { MediaProcessor } from "./processor";

type OutputFormat = { extension: string; contentType: string; apply: (image: Sharp) => Sharp };

const JPEG: OutputFormat = {
  extension: "jpg",
  contentType: "image/jpeg",
  apply: (image) => image.jpeg({ quality: 88, mozjpeg: true }),
};
const PNG: OutputFormat = {
  extension: "png",
  contentType: "image/png",
  apply: (image) => image.png({ compressionLevel: 9, adaptiveFiltering: true }),
};
const WEBP: OutputFormat = {
  extension: "webp",
  contentType: "image/webp",
  apply: (image) => image.webp({ quality: 88 }),
};

const OUTPUT_BY_INPUT: Record<string, OutputFormat> = {
  "image/jpeg": JPEG,
  "image/png": PNG,
  "image/webp": WEBP,
  "image/gif": WEBP,
  "image/avif": WEBP,
};

/**
 * Fully decodes and re-encodes every image. This strips EXIF/GPS/XMP metadata,
 * applies orientation, caps dimensions and destroys polyglot payloads appended to
 * or embedded in the original file. The colour profile is preserved.
 */
export class ImageProcessor implements MediaProcessor {
  readonly kind = "image" as const;

  async process(file: VerifiedFile, temp: TempFileRegistry): Promise<ProcessedAsset> {
    const output = OUTPUT_BY_INPUT[file.mimeType];
    if (!output) throw new UploadError("This image format is not supported.", 415);

    const animated = file.mimeType === "image/gif" || file.mimeType === "image/webp";
    const outputPath = await temp.create(output.extension);

    let info: OutputInfo;
    try {
      const pipeline = sharp(file.tempPath, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error", animated })
        .rotate()
        .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
        .keepIccProfile();
      info = await output.apply(pipeline).toFile(outputPath);
    } catch (error) {
      console.warn("[upload] image decode failed", error);
      throw new UploadError("The image could not be processed. It may be corrupt.", 422);
    }

    const height = info.pageHeight ?? info.height;
    return {
      primary: { path: outputPath, contentType: output.contentType, extension: output.extension },
      width: info.width,
      height,
      blurDataUrl: await createBlurDataUrl(outputPath),
    };
  }
}
