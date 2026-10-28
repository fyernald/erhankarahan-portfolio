"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, FileWarning, X } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import type { UploadTask } from "@/hooks/use-uploader";
import { formatBytes } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const STATUS_TEXT: Record<UploadTask["status"], string> = {
  queued: "Waiting…",
  uploading: "Uploading",
  processing: "Scanning & optimising…",
  done: "Uploaded",
  error: "Failed",
  cancelled: "Cancelled",
};

type UploadQueueProps = {
  tasks: UploadTask[];
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
  className?: string;
};

/** Live list of uploads with progress, server-side processing state and errors. */
export function UploadQueue({ tasks, onCancel, onDismiss, className }: UploadQueueProps) {
  return (
    <ul className={cn("flex flex-col gap-2", className)} aria-live="polite">
      <AnimatePresence initial={false}>
        {tasks.map((task) => {
          const finished = task.status === "done" || task.status === "error" || task.status === "cancelled";
          return (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-line bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={task.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink">{task.name}</p>
                    <span className="shrink-0 text-xs text-muted tabular-nums">
                      {task.status === "uploading" ? `${task.progress}%` : formatBytes(task.size)}
                    </span>
                  </div>
                  <p className={cn("mt-0.5 text-xs", task.status === "error" ? "text-danger" : "text-muted")}>
                    {task.status === "error" ? task.error : STATUS_TEXT[task.status]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => (finished ? onDismiss(task.id) : onCancel(task.id))}
                  className="rounded-md p-1 text-muted transition-colors hover:bg-canvas hover:text-ink"
                  aria-label={finished ? `Dismiss ${task.name}` : `Cancel ${task.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
              {!finished && (
                <ProgressBar
                  className="mt-2.5"
                  value={task.status === "uploading" ? task.progress : task.status === "queued" ? 0 : undefined}
                />
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function StatusIcon({ status }: { status: UploadTask["status"] }) {
  if (status === "done") return <CheckCircle2 className="size-5 shrink-0 text-success" />;
  if (status === "error" || status === "cancelled") return <FileWarning className="size-5 shrink-0 text-danger" />;
  return (
    <span className="flex size-5 shrink-0 items-center justify-center text-ink">
      <Spinner />
    </span>
  );
}
