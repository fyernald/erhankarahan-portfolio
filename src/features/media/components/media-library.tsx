"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FileText, Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useUploader } from "@/hooks/use-uploader";
import { MEDIA_KINDS } from "@/lib/uploads/types";
import { formatBytes, formatDuration } from "@/lib/utils/format";
import type { MediaItem } from "../types";
import { Dropzone } from "./dropzone";
import { MediaDetailsDialog } from "./media-details-dialog";
import { MediaThumb } from "./media-thumb";
import { UploadQueue } from "./upload-queue";

type MediaLibraryProps = { items: MediaItem[]; filtered: boolean };

export function MediaLibrary({ items: initialItems, filtered }: MediaLibraryProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  // Re-sync with fresh server data (after refresh/navigation) without remounting,
  // so uploads that are still in flight keep their progress UI.
  const [sourceItems, setSourceItems] = useState(initialItems);
  if (sourceItems !== initialItems) {
    setSourceItems(initialItems);
    setItems(initialItems);
  }
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const uploader = useUploader({
    kinds: MEDIA_KINDS,
    onUploaded: (item) => {
      setItems((current) => [item, ...current]);
      router.refresh();
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Dropzone kinds={MEDIA_KINDS} onFiles={uploader.enqueue} />
        <Card className="flex flex-col p-4">
          <p className="mb-3 text-[13px] font-bold text-ink">Upload queue</p>
          {uploader.tasks.length === 0 ? (
            <p className="flex flex-1 items-center justify-center rounded-xl bg-canvas px-4 py-8 text-center text-xs text-muted">
              Every file is checked for its real type, scanned and optimised before it is stored. Metadata such as GPS location is removed.
            </p>
          ) : (
            <UploadQueue tasks={uploader.tasks} onCancel={uploader.cancel} onDismiss={uploader.dismiss} className="max-h-72 overflow-y-auto" />
          )}
        </Card>
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState icon={Images} title={filtered ? "No files match" : "Your library is empty"} description="Uploaded photos, videos and documents will appear here." />
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group block w-full overflow-hidden rounded-card border border-line bg-surface text-left shadow-card transition-shadow hover:shadow-popover"
                >
                  <div className="relative overflow-hidden">
                    <MediaThumb item={item} className="aspect-square w-full transition-transform duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 260px, 50vw" />
                    {item.kind === "video" && item.durationSeconds && (
                      <span className="absolute top-2 left-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    {item.kind === "document" && <FileText className="size-4 shrink-0 text-muted" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink">{item.originalName}</p>
                      <p className="text-[11px] text-muted">{formatBytes(item.sizeBytes)}</p>
                    </div>
                  </div>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {selected && (
        <MediaDetailsDialog
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
            setSelected(updated);
          }}
          onDeleted={(id) => {
            setSelected(null);
            setItems((current) => current.filter((entry) => entry.id !== id));
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
