import type { JSONContent } from "@tiptap/core";

/**
 * ProseMirror creates node `attrs` with a null prototype. React's server action
 * serializer treats such objects as opaque client references, so documents must be
 * converted to plain JSON before they are sent to the server.
 */
export function toPlainDocument(content: JSONContent): { type: "doc"; content?: { type: string }[] } {
  return JSON.parse(JSON.stringify(content));
}
