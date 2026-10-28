"use client";

import { useState } from "react";
import { FileText, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaKind } from "@/lib/uploads/types";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import type { MediaItem } from "../types";
import { MediaPickerDialog } from "./media-picker-dialog";
import { MediaThumb } from "./media-thumb";

type MediaFieldProps = {
  label: string;
  value: MediaItem | null;
  onChange: (item: MediaItem | null) => void;
  kinds?: readonly MediaKind[];
  hint?: string;
  aspect?: "video" | "square" | "portrait";
};

const ASPECTS = { video: "aspect-video", square: "aspect-square", portrait: "aspect-[4/5]" } as const;

/** Single media selector used for covers, hero images and the CV document. */
export function MediaField({ label, value, onChange, kinds = ["image"], hint, aspect = "video" }: MediaFieldProps) {
  const [open, setOpen] = useState(false);
  const isDocument = kinds.length === 1 && kinds[0] === "document";

  return (
    <div className={cn("flex flex-col gap-1.5", !isDocument && aspect !== "video" && "w-full max-w-xs")}>
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      {value ? (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {isDocument ? (
            <div className="flex items-center gap-3 p-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-mist text-ink">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{value.originalName}</p>
                <p className="text-xs text-muted">{formatBytes(value.sizeBytes)}</p>
              </div>
            </div>
          ) : (
            <MediaThumb item={value} className={`${ASPECTS[aspect]} w-full`} sizes="360px" />
          )}
          <div className="flex gap-1 border-t border-line p-1.5">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setOpen(true)}>
              <RefreshCw className="size-3.5" /> Replace
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 hover:text-danger" onClick={() => onChange(null)}>
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex ${isDocument ? "py-6" : ASPECTS[aspect]} w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-canvas/60 text-muted transition-colors hover:border-ink/40 hover:bg-mist/60 hover:text-ink`}
        >
          <ImagePlus className="size-5" />
          <span className="text-xs font-bold">Choose {isDocument ? "document" : "image"}</span>
        </button>
      )}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <MediaPickerDialog open={open} onOpenChange={setOpen} kinds={kinds} title={label} onSelect={([item]) => onChange(item ?? null)} />
    </div>
  );
}
