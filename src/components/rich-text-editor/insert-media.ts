import type { Editor } from "@tiptap/react";
import type { MediaItem } from "@/features/media/types";
import { formatBytes } from "@/lib/utils/format";

/** Inserts an uploaded/selected media item as the right node type at the cursor. */
export function insertMedia(editor: Editor, item: MediaItem, position?: number) {
  const chain = editor.chain().focus();
  if (position !== undefined) chain.setTextSelection(position);

  switch (item.kind) {
    case "image":
      chain.setImage({ src: item.url, alt: item.alt || item.originalName.replace(/\.[^.]+$/, "") }).run();
      break;
    case "video":
      chain.setVideo({ src: item.url, poster: item.posterUrl }).run();
      break;
    case "document":
      chain.setFileAttachment({ href: item.url, name: item.originalName, sizeLabel: formatBytes(item.sizeBytes) }).run();
      break;
  }
}
