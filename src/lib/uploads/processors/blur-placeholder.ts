import sharp from "sharp";

/** Tiny (≤16px) WebP preview encoded as a data URL for blur-up placeholders. */
export async function createBlurDataUrl(imagePath: string): Promise<string> {
  const buffer = await sharp(imagePath).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}
