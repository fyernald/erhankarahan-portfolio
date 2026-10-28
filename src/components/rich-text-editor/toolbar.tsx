"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, CodeSquare, FileUp, Film, Heading2, Heading3, Heading4,
  Highlighter, ImagePlus, Italic, Link2, List, ListChecks, ListOrdered, Minus, Pilcrow, Quote, Redo2, Strikethrough,
  Subscript, Superscript, Table, Underline, Undo2, MonitorPlay,
} from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils/cn";
import { TableControls } from "./table-controls";
import { ToolbarButton, ToolbarDivider } from "./toolbar-button";

export type InsertKind = "image" | "video" | "document";

type ToolbarProps = {
  editor: Editor;
  onInsertMedia: (kind: InsertKind) => void;
  onEditLink: () => void;
  onInsertYoutube: () => void;
};

const TEXT_COLORS = [
  { label: "Default", value: null },
  { label: "Slate", value: "#50575d" },
  { label: "Ocean", value: "#2c6680" },
  { label: "Forest", value: "#1f7a4d" },
  { label: "Amber", value: "#a8660b" },
  { label: "Rose", value: "#b4365a" },
] as const;

export function Toolbar({ editor, onInsertMedia, onEditLink, onInsertYoutube }: ToolbarProps) {
  // Subscribe only to the bits of state the toolbar renders, avoiding re-renders per keystroke.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      highlight: e.isActive("highlight"),
      subscript: e.isActive("subscript"),
      superscript: e.isActive("superscript"),
      link: e.isActive("link"),
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      taskList: e.isActive("taskList"),
      blockquote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      table: e.isActive("table"),
      alignCenter: e.isActive({ textAlign: "center" }),
      alignRight: e.isActive({ textAlign: "right" }),
      alignJustify: e.isActive({ textAlign: "justify" }),
      color: (e.getAttributes("textStyle").color as string | undefined) ?? null,
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const alignLeft = !state.alignCenter && !state.alignRight && !state.alignJustify;

  return (
    <div className="sticky top-16 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2" role="toolbar" aria-label="Formatting">
        <ToolbarButton label="Undo" shortcut="Ctrl+Z" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" shortcut="Ctrl+Shift+Z" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 className="size-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Small heading" active={state.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()}>
          <Heading4 className="size-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Bold" shortcut="Ctrl+B" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" shortcut="Ctrl+I" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline" shortcut="Ctrl+U" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Highlight" active={state.highlight} onClick={() => chain().toggleHighlight().run()}>
          <Highlighter className="size-4" />
        </ToolbarButton>
        <ColorPicker current={state.color} onPick={(color) => (color ? chain().setColor(color).run() : chain().unsetColor().run())} />
        <ToolbarButton label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()}>
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Subscript" active={state.subscript} onClick={() => chain().toggleSubscript().run()}>
          <Subscript className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Superscript" active={state.superscript} onClick={() => chain().toggleSuperscript().run()}>
          <Superscript className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" shortcut="Ctrl+K" active={state.link} onClick={onEditLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Align left" active={alignLeft} onClick={() => chain().setTextAlign("left").run()}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align center" active={state.alignCenter} onClick={() => chain().setTextAlign("center").run()}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align right" active={state.alignRight} onClick={() => chain().setTextAlign("right").run()}>
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Justify" active={state.alignJustify} onClick={() => chain().setTextAlign("justify").run()}>
          <AlignJustify className="size-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Bulleted list" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Checklist" active={state.taskList} onClick={() => chain().toggleTaskList().run()}>
          <ListChecks className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>
          <CodeSquare className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
          <Minus className="size-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Insert image" onClick={() => onInsertMedia("image")}>
          <ImagePlus className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Insert video" onClick={() => onInsertMedia("video")}>
          <Film className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Attach document" onClick={() => onInsertMedia("document")}>
          <FileUp className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Embed YouTube video" onClick={onInsertYoutube}>
          <MonitorPlay className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Insert table"
          active={state.table}
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <Table className="size-4" />
        </ToolbarButton>
      </div>
      {state.table && <TableControls editor={editor} />}
    </div>
  );
}

function ColorPicker({ current, onPick }: { current: string | null; onPick: (color: string | null) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          className="flex size-8 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg text-body hover:bg-canvas hover:text-ink"
          aria-label="Text colour"
        >
          <span className="text-sm leading-none font-bold">A</span>
          <span className="h-[3px] w-4 rounded-full" style={{ backgroundColor: current ?? "#0e1113" }} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} className="z-50 grid grid-cols-6 gap-1.5 rounded-xl border border-line bg-surface p-2 shadow-popover animate-fade-in">
          {TEXT_COLORS.map((color) => (
            <Popover.Close asChild key={color.label}>
              <button
                type="button"
                onClick={() => onPick(color.value)}
                aria-label={color.label}
                title={color.label}
                className={cn(
                  "size-6 rounded-full ring-offset-2 transition-transform hover:scale-110",
                  current === color.value && "ring-2 ring-ink",
                  !color.value && "border border-line-strong bg-white",
                )}
                style={color.value ? { backgroundColor: color.value } : undefined}
              />
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
