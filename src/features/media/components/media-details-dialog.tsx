"use client";

import { useEffect, useState } from "react";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import { formatBytes, formatDate, formatDuration } from "@/lib/utils/format";
import { deleteMedia, getMediaUsage, updateMediaAlt } from "../actions";
import type { MediaItem } from "../types";
import { MediaPreview } from "./media-preview";

type MediaDetailsDialogProps = {
  item: MediaItem;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (item: MediaItem) => void;
};

export function MediaDetailsDialog({ item, onClose, onDeleted, onUpdated }: MediaDetailsDialogProps) {
  const [alt, setAlt] = useState(item.alt);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [references, setReferences] = useState<number | null>(null);

  const saveAlt = useServerAction(updateMediaAlt, {
    successMessage: "Alt text saved",
    onSuccess: () => onUpdated({ ...item, alt }),
  });
  const usage = useServerAction(getMediaUsage, { silentErrors: true });
  const remove = useServerAction(deleteMedia, { successMessage: "File deleted" });

  useEffect(() => {
    if (!confirmOpen) return;
    let cancelled = false;
    void usage.run({ id: item.id }).then((result) => {
      if (!cancelled && result.ok) setReferences(result.data.references);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when the confirm dialog opens
  }, [confirmOpen, item.id]);

  const details: [string, string][] = [
    ["Type", item.mimeType],
    ["Size", formatBytes(item.sizeBytes)],
    ...(item.width && item.height ? [["Dimensions", `${item.width} × ${item.height}px`] as [string, string]] : []),
    ...(item.durationSeconds ? [["Duration", formatDuration(item.durationSeconds)] as [string, string]] : []),
    ["Uploaded", formatDate(item.createdAt, "MMM d, yyyy 'at' HH:mm")],
  ];

  async function copyUrl() {
    await navigator.clipboard.writeText(new URL(item.url, window.location.origin).toString());
    toast.success("Link copied to clipboard");
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()} title={item.originalName} size="lg">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <MediaPreview item={item} />
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {details.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted">{label}</dt>
                  <dd className="truncate text-right font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            {item.kind !== "document" && (
              <form
                className="flex flex-col gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveAlt.run({ id: item.id, alt });
                }}
              >
                <Field label="Alt text" hint="Describe the content for screen readers and SEO.">
                  <Input value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={240} placeholder="e.g. Balloons over Cappadocia at sunrise" />
                </Field>
                <Button type="submit" variant="secondary" size="sm" className="self-end" loading={saveAlt.pending} disabled={alt === item.alt}>
                  Save alt text
                </Button>
              </form>
            )}
            <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
              <Button variant="secondary" size="sm" onClick={copyUrl}>
                <Copy className="size-3.5" /> Copy link
              </Button>
              <a href={item.url} download className={buttonClassName("secondary", "sm")}>
                <Download className="size-3.5" /> Download
              </a>
              <Button variant="ghost" size="sm" className="ml-auto text-danger hover:bg-danger-soft hover:text-danger" onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this file?"
        description={
          references === null
            ? "Checking where this file is used…"
            : references > 0
              ? `This file is used in ${references} ${references === 1 ? "place" : "places"} (posts, projects or site settings). It will disappear from them. This cannot be undone.`
              : "This file isn't used anywhere. It will be permanently deleted."
        }
        onConfirm={async () => {
          const result = await remove.run({ id: item.id });
          if (!result.ok) return false;
          onDeleted(item.id);
        }}
      />
    </>
  );
}
