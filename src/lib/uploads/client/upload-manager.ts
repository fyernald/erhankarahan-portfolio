import type { MediaItem } from "@/features/media/types";
import type { MediaKind } from "@/lib/uploads/types";
import { uploadFile, type UploadPhase } from "./upload-file";

export type UploadStatus = UploadPhase | "queued" | "done" | "error" | "cancelled";

export type UploadTask = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  result?: MediaItem;
  /** The component instance that started the upload (see `useUploader`). */
  owner?: string;
};

type QueuedUpload = { id: string; file: File; kinds?: readonly MediaKind[] };
type UploadedListener = (item: MediaItem, task: UploadTask) => void;

/** Number of files sent in parallel, so large batches don't saturate the connection. */
const CONCURRENCY = 2;
const NO_TASKS: readonly UploadTask[] = [];

export function isUploadActive(task: UploadTask): boolean {
  return task.status === "queued" || task.status === "uploading" || task.status === "processing";
}

/**
 * Tab-wide upload queue. It lives at module level, outside React, so an upload keeps
 * running when the page that started it goes away: navigating elsewhere, a router
 * refresh, or an error boundary. Only closing or reloading the tab stops it, and the
 * browser asks for confirmation first while anything is in flight.
 */
class UploadManager {
  private tasks: readonly UploadTask[] = NO_TASKS;
  private queue: QueuedUpload[] = [];
  private controllers = new Map<string, AbortController>();
  private active = 0;
  private listeners = new Set<() => void>();
  private uploadedListeners = new Set<UploadedListener>();
  private leaveGuardInstalled = false;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.tasks;

  getServerSnapshot = () => NO_TASKS;

  /** Called for every finished upload, wherever it was started. */
  onUploaded(listener: UploadedListener) {
    this.uploadedListeners.add(listener);
    return () => {
      this.uploadedListeners.delete(listener);
    };
  }

  enqueue(files: File[] | FileList, options: { kinds?: readonly MediaKind[]; owner?: string } = {}) {
    const items = Array.from(files).map((file) => ({ id: crypto.randomUUID(), file, kinds: options.kinds }));
    if (items.length === 0) return;
    this.tasks = [
      ...items.map(({ id, file }) => ({
        id,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "queued" as const,
        owner: options.owner,
      })),
      ...this.tasks,
    ];
    this.queue.push(...items);
    this.emit();
    this.pump();
  }

  cancel(id: string) {
    const queuedIndex = this.queue.findIndex((item) => item.id === id);
    if (queuedIndex >= 0) {
      this.queue.splice(queuedIndex, 1);
      this.patch(id, { status: "cancelled" });
    }
    this.controllers.get(id)?.abort();
  }

  dismiss(id: string) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.emit();
  }

  /** Removes finished, failed and cancelled uploads, optionally only those of one owner. */
  dismissFinished(owner?: string) {
    this.tasks = this.tasks.filter((task) => isUploadActive(task) || (owner !== undefined && task.owner !== owner));
    this.emit();
  }

  private pump() {
    while (this.active < CONCURRENCY && this.queue.length > 0) {
      const next = this.queue.shift()!;
      const controller = new AbortController();
      this.controllers.set(next.id, controller);
      this.active += 1;

      uploadFile(next.file, {
        kinds: next.kinds,
        signal: controller.signal,
        onProgress: (progress) => this.patch(next.id, { progress }),
        onPhaseChange: (status) => this.patch(next.id, { status, ...(status === "processing" ? { progress: 100 } : {}) }),
      })
        .then((result) => {
          const task = this.tasks.find((entry) => entry.id === next.id);
          // Listeners run before the status flips to "done", so anything waiting for
          // the queue to go idle (e.g. a router refresh) already sees this result.
          if (task) for (const listener of this.uploadedListeners) listener(result, task);
          this.patch(next.id, { status: "done", progress: 100, result });
        })
        .catch((error: Error) => {
          this.patch(next.id, { status: controller.signal.aborted ? "cancelled" : "error", error: error.message });
        })
        .finally(() => {
          this.controllers.delete(next.id);
          this.active -= 1;
          this.pump();
        });
    }
  }

  private patch(id: string, update: Partial<UploadTask>) {
    this.tasks = this.tasks.map((task) => (task.id === id ? { ...task, ...update } : task));
    this.emit();
  }

  private emit() {
    this.syncLeaveGuard();
    for (const listener of this.listeners) listener();
  }

  /** Asks before closing or reloading the tab while uploads are in flight. */
  private syncLeaveGuard() {
    const busy = this.tasks.some(isUploadActive);
    if (busy === this.leaveGuardInstalled) return;
    if (busy) window.addEventListener("beforeunload", preventUnload);
    else window.removeEventListener("beforeunload", preventUnload);
    this.leaveGuardInstalled = busy;
  }
}

function preventUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  // Older browsers only show the prompt when returnValue is set.
  event.returnValue = "";
}

export const uploadManager = new UploadManager();
