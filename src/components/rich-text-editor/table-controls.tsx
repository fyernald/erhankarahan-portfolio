"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";

/** Contextual row/column actions shown while the cursor is inside a table. */
export function TableControls({ editor }: { editor: Editor }) {
  const actions = [
    { label: "+ Row above", run: () => editor.chain().focus().addRowBefore().run() },
    { label: "+ Row below", run: () => editor.chain().focus().addRowAfter().run() },
    { label: "+ Column left", run: () => editor.chain().focus().addColumnBefore().run() },
    { label: "+ Column right", run: () => editor.chain().focus().addColumnAfter().run() },
    { label: "Delete row", run: () => editor.chain().focus().deleteRow().run() },
    { label: "Delete column", run: () => editor.chain().focus().deleteColumn().run() },
    { label: "Toggle header", run: () => editor.chain().focus().toggleHeaderRow().run() },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-t border-line bg-canvas/60 px-3 py-1.5 animate-fade-in">
      <span className="mr-2 shrink-0 text-xs font-bold text-muted">Table</span>
      {actions.map((action) => (
        <Button key={action.label} variant="ghost" size="sm" onMouseDown={(event) => event.preventDefault()} onClick={action.run}>
          {action.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="text-danger hover:text-danger"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        Delete table
      </Button>
    </div>
  );
}
