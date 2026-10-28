"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Tooltip } from "radix-ui";
import { Bold, Italic, Link2, Underline } from "lucide-react";
import { MediaPickerDialog } from "@/features/media/components/media-picker-dialog";
import { UploadQueue } from "@/features/media/components/upload-queue";
import type { MediaItem } from "@/features/media/types";
import { useLatest } from "@/hooks/use-latest";
import { useUploader } from "@/hooks/use-uploader";
import { createRichTextExtensions } from "@/lib/rich-text/extensions";
import { insertMedia } from "./insert-media";
import { LinkDialog } from "./link-dialog";
import { Toolbar, type InsertKind } from "./toolbar";
import { ToolbarButton } from "./toolbar-button";
import { validateLinkUrl, validateYoutubeUrl } from "./url-validation";

type RichTextEditorProps = {
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
};

type DialogState = { type: "link" } | { type: "youtube" } | { type: "media"; kind: InsertKind } | null;

const PICKER_TITLES: Record<InsertKind, string> = {
  image: "Insert image",
  video: "Insert video",
  document: "Attach document",
};

/**
 * Block-based rich text editor (Tiptap/ProseMirror). Supports headings, marks,
 * colours, alignment, lists, checklists, tables, code, links, YouTube embeds and
 * images/videos/documents uploaded through the secure pipeline — including
 * drag-and-drop and paste straight into the document.
 */
export function RichTextEditor({ initialContent, onChange, placeholder = "Tell your story…" }: RichTextEditorProps) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const editorRef = useRef<Editor | null>(null);

  const uploader = useUploader({
    onUploaded: (item: MediaItem) => {
      if (editorRef.current) insertMedia(editorRef.current, item);
    },
  });
  const enqueueRef = useLatest(uploader.enqueue);

  const extensions = useMemo(
    () => [
      ...createRichTextExtensions(),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: { class: "rich-text px-5 py-8 sm:px-10 lg:px-14", spellcheck: "true" },
      handleDrop: (view, event, _slice, moved) => {
        const files = event.dataTransfer?.files;
        if (moved || !files?.length) return false;
        event.preventDefault();
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        if (position !== undefined) editorRef.current?.commands.setTextSelection(position);
        enqueueRef.current(Array.from(files));
        return true;
      },
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (!files?.length) return false;
        event.preventDefault();
        enqueueRef.current(Array.from(files));
        return true;
      },
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setDialog({ type: "link" });
          return true;
        }
        return false;
      },
    },
    onCreate: ({ editor: created }) => {
      editorRef.current = created;
    },
    onUpdate: ({ editor: updated }) => onChange(updated.getJSON()),
  });

  const applyLink = useCallback(
    (href: string) => {
      if (!editor) return;
      const chain = editor.chain().focus().extendMarkRange("link");
      if (editor.state.selection.empty && !editor.isActive("link")) {
        chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
      } else {
        chain.setLink({ href }).run();
      }
    },
    [editor],
  );

  if (!editor) return <div className="min-h-[520px] skeleton" aria-busy />;

  const currentLink = (editor.getAttributes("link").href as string | undefined) ?? "";

  return (
    <Tooltip.Provider>
      <div className="relative">
        <Toolbar
          editor={editor}
          onInsertMedia={(kind) => setDialog({ type: "media", kind })}
          onEditLink={() => setDialog({ type: "link" })}
          onInsertYoutube={() => setDialog({ type: "youtube" })}
        />

        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: e, state }) => !state.selection.empty && !e.isActive("image") && !e.isActive("codeBlock")}
          className="flex items-center gap-0.5 rounded-xl border border-line bg-surface p-1 shadow-popover"
        >
          <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Underline className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor.isActive("link")} onClick={() => setDialog({ type: "link" })}>
            <Link2 className="size-4" />
          </ToolbarButton>
        </BubbleMenu>

        <EditorContent editor={editor} />

        <EditorFooter editor={editor} />

        {uploader.tasks.length > 0 && (
          <div className="fixed right-4 bottom-4 z-40 w-[min(360px,calc(100vw-2rem))]">
            <UploadQueue tasks={uploader.tasks} onCancel={uploader.cancel} onDismiss={uploader.dismiss} />
          </div>
        )}

        <LinkDialog
          open={dialog?.type === "link"}
          onOpenChange={(open) => !open && setDialog(null)}
          title={currentLink ? "Edit link" : "Add link"}
          label="URL"
          placeholder="https://"
          initialValue={currentLink}
          validate={validateLinkUrl}
          onSubmit={applyLink}
          onRemove={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
        />
        <LinkDialog
          open={dialog?.type === "youtube"}
          onOpenChange={(open) => !open && setDialog(null)}
          title="Embed YouTube video"
          label="YouTube link"
          placeholder="https://www.youtube.com/watch?v=…"
          validate={validateYoutubeUrl}
          onSubmit={(src) => editor.chain().focus().setYoutubeVideo({ src }).run()}
        />
        {dialog?.type === "media" && (
          <MediaPickerDialog
            open
            onOpenChange={(open) => !open && setDialog(null)}
            kinds={[dialog.kind]}
            multiple={dialog.kind === "image"}
            title={PICKER_TITLES[dialog.kind]}
            onSelect={(items) => items.forEach((item) => insertMedia(editor, item))}
          />
        )}
      </div>
    </Tooltip.Provider>
  );
}

function EditorFooter({ editor }: { editor: Editor }) {
  const { words, characters } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      words: e.storage.characterCount.words() as number,
      characters: e.storage.characterCount.characters() as number,
    }),
  });
  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted sm:px-10 lg:px-14">
      <span>Drop or paste images, videos and documents directly into the text.</span>
      <span className="shrink-0 tabular-nums">
        {words} words · {characters} characters
      </span>
    </div>
  );
}
