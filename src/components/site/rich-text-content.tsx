import { withResponsiveImages } from "@/lib/rich-text/responsive-images";
import { sanitizeRichHtml } from "@/lib/rich-text/sanitize";
import { cn } from "@/lib/utils/cn";

/**
 * Renders stored article HTML. It was sanitised when saved; it is sanitised again
 * here so even a tampered database row cannot inject markup.
 */
export function RichTextContent({ html, className }: { html: string; className?: string }) {
  return <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: withResponsiveImages(sanitizeRichHtml(html)) }} />;
}
