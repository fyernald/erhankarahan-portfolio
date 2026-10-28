"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUploader } from "@/hooks/use-uploader";
import type { MediaKind } from "@/lib/uploads/types";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";
import { browseMedia } from "../actions";
import type { MediaItem } from "../types";
import { Dropzone } from "./dropzone";
import { MediaThumb } from "./media-thumb";
import { UploadQueue } from "./upload-queue";

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kinds: readonly MediaKind[];
  multiple?: boolean;
  title?: string;
  onSelect: (items: MediaItem[]) => void;
};

/**
 * Library browser + uploader in one dialog. Freshly uploaded files appear first and
 * are pre-selected, so "upload then insert" is a single flow.
 */
export function MediaPickerDialog(props: MediaPickerDialogProps) {
  // Mount the picker only while open so its state (selection, search) starts fresh each time.
  return props.open ? <OpenMediaPicker {...props} /> : null;
}

function OpenMediaPicker({ onOpenChange, kinds: kindsProp, multiple = false, title = "Choose media", onSelect }: MediaPickerDialogProps) {
  // Callers often pass inline arrays; freeze the value for the lifetime of the open dialog.
  const [kinds] = useState(kindsProp);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MediaItem[]>([]);

  const toggle = useCallback(
    (item: MediaItem) =>
      setSelected((current) => {
        const exists = current.some((entry) => entry.id === item.id);
        if (exists) return current.filter((entry) => entry.id !== item.id);
        return multiple ? [...current, item] : [item];
      }),
    [multiple],
  );

  const uploader = useUploader({
    kinds,
    onUploaded: (item) => {
      setItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
      setSelected((current) => (multiple ? [...current, item] : [item]));
    },
  });

  const load = useCallback(
    async (nextPage: number, query: string, append: boolean) => {
      setLoading(true);
      const result = await browseMedia({ kinds: [...kinds], search: query || undefined, page: nextPage });
      setLoading(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems((current) => (append ? [...current, ...result.data.items] : result.data.items));
      setPage(result.data.page);
      setPageCount(result.data.pageCount);
    },
    [kinds],
  );

  useEffect(() => {
    const timer = setTimeout(() => void load(1, search, false), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, load]);

  function confirm() {
    onSelect(selected);
    onOpenChange(false);
  }

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title={title}
      description={multiple ? "Select one or more files, or upload new ones." : "Select a file or upload a new one."}
      size="xl"
      footer={
        <>
          <span className="mr-auto self-center text-xs text-muted">
            {selected.length > 0 ? `${selected.length} selected` : "Nothing selected"}
          </span>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={selected.length === 0 || uploader.isBusy}>
            {uploader.isBusy ? "Waiting for uploads…" : multiple ? `Add ${selected.length || ""}`.trim() : "Use file"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Dropzone kinds={kinds} onFiles={uploader.enqueue} multiple={multiple} compact />
        {uploader.tasks.length > 0 && (
          <UploadQueue tasks={uploader.tasks} onCancel={uploader.cancel} onDismiss={uploader.dismiss} />
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by file name or alt text"
            className="pl-9"
            aria-label="Search media"
          />
        </div>

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No files found. Upload one above.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => {
              const isSelected = selected.some((entry) => entry.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item)}
                  onDoubleClick={() => {
                    if (!multiple) {
                      onSelect([item]);
                      onOpenChange(false);
                    }
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border bg-surface text-left transition-all",
                    isSelected ? "border-ink ring-2 ring-ink" : "border-line hover:border-line-strong",
                  )}
                >
                  <MediaThumb item={item} className="aspect-square w-full" sizes="180px" />
                  <span className="truncate px-2.5 pt-2 text-xs font-semibold text-ink">{item.originalName}</span>
                  <span className="px-2.5 pb-2 text-[11px] text-muted">{formatBytes(item.sizeBytes)}</span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-ink text-white animate-fade-in">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {page < pageCount && (
          <Button variant="secondary" className="self-center" loading={loading} onClick={() => load(page + 1, search, true)}>
            Load more
          </Button>
        )}
      </div>
    </Dialog>
  );
}
