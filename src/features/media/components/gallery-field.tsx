"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaKind } from "@/lib/uploads/types";
import type { MediaItem } from "../types";
import { MediaPickerDialog } from "./media-picker-dialog";
import { MediaThumb } from "./media-thumb";

type GalleryFieldProps = {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  kinds?: readonly MediaKind[];
};

function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Ordered collection of images/videos with add, remove and reorder controls. */
export function GalleryField({ value, onChange, kinds = ["image", "video"] }: GalleryFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function add(items: MediaItem[]) {
    const existing = new Set(value.map((item) => item.id));
    onChange([...value, ...items.filter((item) => !existing.has(item.id))]);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-xl border border-line"
          >
            <MediaThumb item={item} className="aspect-square w-full" sizes="220px" />
            <span className="absolute top-2 left-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              {index + 1}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                <GalleryAction label="Move earlier" disabled={index === 0} onClick={() => onChange(move(value, index, index - 1))}>
                  <ChevronLeft className="size-4" />
                </GalleryAction>
                <GalleryAction label="Move later" disabled={index === value.length - 1} onClick={() => onChange(move(value, index, index + 1))}>
                  <ChevronRight className="size-4" />
                </GalleryAction>
              </div>
              <GalleryAction label="Remove from gallery" onClick={() => onChange(value.filter((entry) => entry.id !== item.id))}>
                <X className="size-4" />
              </GalleryAction>
            </div>
          </motion.div>
        ))}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-canvas/60 text-muted transition-colors hover:border-ink/40 hover:bg-mist/60 hover:text-ink"
        >
          <ImagePlus className="size-5" />
          <span className="text-xs font-bold">Add media</span>
        </button>
      </div>
      <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} kinds={kinds} multiple title="Add to gallery" onSelect={add} />
    </div>
  );
}

function GalleryAction({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant="secondary"
      size="icon-sm"
      className="size-7 border-0 bg-white/90 shadow-sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
