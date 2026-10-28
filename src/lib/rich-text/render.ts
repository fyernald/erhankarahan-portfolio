import "server-only";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import type { JSONContent } from "@tiptap/core";
import { DomainError } from "@/lib/actions/errors";
import { createRichTextExtensions } from "./extensions";
import { sanitizeRichHtml, toPlainText } from "./sanitize";

const WORDS_PER_MINUTE = 220;

export type RenderedRichText = {
  html: string;
  plainText: string;
  readingMinutes: number;
};

/**
 * Converts editor JSON into sanitised HTML. Rendering through the schema means
 * unknown nodes/marks are rejected, and the allow-list sanitiser runs afterwards.
 */
export function renderRichText(content: JSONContent): RenderedRichText {
  let rawHtml: string;
  try {
    rawHtml = renderToHTMLString({ content, extensions: createRichTextExtensions() });
  } catch (error) {
    console.warn("[rich-text] failed to render document", error);
    throw new DomainError("The content contains unsupported elements.");
  }

  const html = sanitizeRichHtml(rawHtml);
  const plainText = toPlainText(html);
  const words = plainText.split(/\s+/).filter(Boolean).length;

  return { html, plainText, readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}

export const EMPTY_DOCUMENT: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };
