"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronUp, FileWarning, X } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { UploadQueue } from "@/features/media/components/upload-queue";
import { useUploadTasks } from "@/hooks/use-uploader";
import { isUploadActive, uploadManager, type UploadTask } from "@/lib/uploads/client/upload-manager";

const MEDIA_LIBRARY_PATH = "/dashboard/media";
/** Exposes the tray's height so the toaster can stack above it (see components/ui/toaster.tsx). */
const HEIGHT_VARIABLE = "--upload-tray-height";

/**
 * Floating progress panel in the bottom-right corner. Uploads run in the tab-wide
 * upload manager, so they keep going while the user moves around the dashboard or the
 * site; this keeps them visible. The media library shows its own queue instead.
 */
export function UploadTray() {
  const tasks = useUploadTasks();
  const pathname = usePathname();
  if (tasks.length === 0 || pathname === MEDIA_LIBRARY_PATH) return null;
  return <TrayPanel tasks={tasks} />;
}

function TrayPanel({ tasks }: { tasks: readonly UploadTask[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty(HEIGHT_VARIABLE, `${element.offsetHeight + 12}px`));
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(HEIGHT_VARIABLE);
    };
  }, []);

  const active = tasks.filter(isUploadActive);
  const failed = tasks.filter((task) => task.status === "error").length;
  const summary = summarise(active, failed, tasks.length);

  return (
    <section
      ref={panel}
      aria-label="Uploads"
      className="fixed right-4 bottom-4 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-surface shadow-popover"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <SummaryIcon busy={active.length > 0} failed={failed > 0} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{summary.title}</p>
          {summary.detail && <p className="text-xs text-muted">{summary.detail}</p>}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-md p-1 text-muted transition-colors hover:bg-canvas hover:text-ink"
          aria-label={collapsed ? "Show uploads" : "Hide upload details"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {active.length === 0 && (
          <button
            type="button"
            onClick={() => uploadManager.dismissFinished()}
            className="rounded-md p-1 text-muted transition-colors hover:bg-canvas hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {active.length > 0 && <ProgressBar value={summary.percent} className="h-1 rounded-none" />}
      {!collapsed && (
        <div className="border-t border-line bg-canvas/60 p-3">
          <UploadQueue
            tasks={tasks}
            onCancel={(id) => uploadManager.cancel(id)}
            onDismiss={(id) => uploadManager.dismiss(id)}
            className="max-h-64 overflow-y-auto"
          />
          <Link href={MEDIA_LIBRARY_PATH} className="mt-3 block text-center text-xs font-bold text-ink hover:underline">
            Open media library
          </Link>
        </div>
      )}
    </section>
  );
}

/** Overall progress weighted by file size; files being processed on the server count as sent. */
function summarise(active: UploadTask[], failed: number, total: number) {
  if (active.length === 0) {
    return {
      title: failed > 0 ? `${failed} of ${total} uploads failed` : total === 1 ? "Upload complete" : `${total} uploads complete`,
      detail: undefined,
      percent: 100,
    };
  }
  const bytes = active.reduce((sum, task) => sum + task.size, 0);
  const sent = active.reduce((sum, task) => sum + (task.size * (task.status === "queued" ? 0 : task.progress)) / 100, 0);
  const percent = bytes > 0 ? Math.round((sent / bytes) * 100) : 0;
  const processing = active.filter((task) => task.status === "processing").length;
  return {
    title: active.length === 1 ? `Uploading ${active[0].name}` : `Uploading ${active.length} files`,
    detail: processing === active.length ? "Scanning & optimising…" : `${percent}% · you can keep working`,
    percent,
  };
}

function SummaryIcon({ busy, failed }: { busy: boolean; failed: boolean }) {
  if (busy) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center text-ink">
        <Spinner />
      </span>
    );
  }
  if (failed) return <FileWarning className="size-5 shrink-0 text-danger" />;
  return <CheckCircle2 className="size-5 shrink-0 text-success" />;
}
