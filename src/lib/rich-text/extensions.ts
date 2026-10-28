import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Typography from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TableKit } from "@tiptap/extension-table";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { common, createLowlight } from "lowlight";
import { FileAttachment } from "./nodes/file-attachment";
import { Video } from "./nodes/video";

export const lowlight = createLowlight(common);

export const ALLOWED_LINK_PROTOCOLS = ["http", "https", "mailto"] as const;

/**
 * The single definition of the document schema. Shared by the editor (client) and
 * the static HTML renderer (server) so both always agree on what content can exist.
 */
export function createRichTextExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: [...ALLOWED_LINK_PROTOCOLS],
        isAllowedUri: (url, ctx) => {
          try {
            const parsed = new URL(url, "https://placeholder.invalid");
            const protocol = parsed.protocol.replace(":", "");
            return ctx.defaultValidate(url) && ALLOWED_LINK_PROTOCOLS.includes(protocol as never);
          } catch {
            return false;
          }
        },
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      },
    }),
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
    Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { loading: "lazy" } }),
    TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"] }),
    Highlight.configure({ multicolor: false }),
    TextStyle,
    Color,
    Subscript,
    Superscript,
    Typography,
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: false } }),
    Youtube.configure({ nocookie: true, controls: true, modestBranding: true, width: 640, height: 360 }),
    Video,
    FileAttachment,
  ];
}
