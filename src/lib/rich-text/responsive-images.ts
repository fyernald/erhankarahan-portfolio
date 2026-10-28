/** Widths must be part of Next's default `deviceSizes`, otherwise the optimizer rejects them. */
const WIDTHS = [640, 828, 1200, 1920] as const;
const QUALITY = 75;
const IMG_TAG = /<img\b([^>]*?)\ssrc="(\/media\/images\/[^"]+)"([^>]*)>/g;

const optimized = (src: string, width: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${QUALITY}`;

/**
 * Article images are stored at up to 3840px. Point them at the Next.js image
 * optimizer with a responsive srcset so readers download an appropriately sized,
 * modern-format (AVIF/WebP) variant. Runs on already-sanitised HTML.
 */
export function withResponsiveImages(html: string, sizes = "(min-width: 768px) 720px, 100vw"): string {
  return html.replace(IMG_TAG, (_match, before: string, src: string, after: string) => {
    const srcset = WIDTHS.map((width) => `${optimized(src, width)} ${width}w`).join(", ");
    return `<img${before} src="${optimized(src, 1200)}" srcset="${srcset}" sizes="${sizes}" decoding="async"${after}>`;
  });
}
