"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { acceptAttributeFor } from "@/lib/uploads/policy";
import type { MediaKind } from "@/lib/uploads/types";
import { cn } from "@/lib/utils/cn";

const KIND_HINTS: Record<MediaKind, string> = {
  image: "JPG, PNG, WEBP, GIF, AVIF",
  video: "MP4, MOV, WEBM",
  document: "PDF, DOCX, XLSX, PPTX",
};

type DropzoneProps = {
  kinds: readonly MediaKind[];
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  compact?: boolean;
  className?: string;
};

export function Dropzone({ kinds, onFiles, multiple = true, compact = false, className }: DropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed text-center transition-colors",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12",
        dragging ? "border-ink bg-mist" : "border-line-strong bg-canvas/60 hover:border-ink/40 hover:bg-mist/60",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-surface text-ink shadow-card transition-transform",
          compact ? "size-10" : "size-12",
          dragging && "scale-110",
        )}
      >
        <UploadCloud className="size-5" />
      </span>
      <span className="text-sm font-bold text-ink">
        {dragging ? "Drop to upload" : "Drag files here or click to browse"}
      </span>
      <span className="text-xs text-muted">{kinds.map((kind) => KIND_HINTS[kind]).join(" · ")}</span>
      <input
        ref={input}
        type="file"
        hidden
        multiple={multiple}
        accept={acceptAttributeFor(kinds)}
        onChange={(event) => {
          if (event.target.files?.length) onFiles(Array.from(event.target.files));
          event.target.value = "";
        }}
      />
    </button>
  );
}
