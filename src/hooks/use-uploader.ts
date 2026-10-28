"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/features/media/types";
import { uploadFile, type UploadPhase } from "@/lib/uploads/client/upload-file";
import type { MediaKind } from "@/lib/uploads/types";
import { useLatest } from "./use-latest";

export type UploadStatus = UploadPhase | "queued" | "done" | "error" | "cancelled";

export type UploadTask = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  result?: MediaItem;
};

type UploaderOptions = {
  kinds?: readonly MediaKind[];
  /** Number of files sent in parallel. */
  concurrency?: number;
  onUploaded?: (item: MediaItem) => void;
};

/**
 * Manages a queue of uploads with per-file progress, phases, cancellation and a
 * small concurrency limit so large batches don't saturate the connection.
 */
export function useUploader({ kinds, concurrency = 2, onUploaded }: UploaderOptions = {}) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const queue = useRef<{ id: string; file: File }[]>([]);
  const active = useRef(0);
  const pumpRef = useRef<() => void>(() => undefined);
  const onUploadedRef = useLatest(onUploaded);

  const patch = useCallback((id: string, update: Partial<UploadTask>) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...update } : task)));
  }, []);

  const pump = useCallback(() => {
    while (active.current < concurrency && queue.current.length > 0) {
      const next = queue.current.shift()!;
      const controller = new AbortController();
      controllers.current.set(next.id, controller);
      active.current += 1;

      uploadFile(next.file, {
        kinds,
        signal: controller.signal,
        onProgress: (progress) => patch(next.id, { progress }),
        onPhaseChange: (status) => patch(next.id, { status, ...(status === "processing" ? { progress: 100 } : {}) }),
      })
        .then((result) => {
          patch(next.id, { status: "done", progress: 100, result });
          onUploadedRef.current?.(result);
        })
        .catch((error: Error) => {
          const cancelled = controller.signal.aborted;
          patch(next.id, { status: cancelled ? "cancelled" : "error", error: error.message });
        })
        .finally(() => {
          controllers.current.delete(next.id);
          active.current -= 1;
          pumpRef.current();
        });
    }
  }, [concurrency, kinds, onUploadedRef, patch]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const enqueue = useCallback(
    (files: File[] | FileList) => {
      const items = Array.from(files).map((file) => ({ id: crypto.randomUUID(), file }));
      if (items.length === 0) return;
      setTasks((current) => [
        ...items.map(({ id, file }) => ({ id, name: file.name, size: file.size, progress: 0, status: "queued" as const })),
        ...current,
      ]);
      queue.current.push(...items);
      pump();
    },
    [pump],
  );

  const cancel = useCallback(
    (id: string) => {
      const queuedIndex = queue.current.findIndex((item) => item.id === id);
      if (queuedIndex >= 0) {
        queue.current.splice(queuedIndex, 1);
        patch(id, { status: "cancelled" });
      }
      controllers.current.get(id)?.abort();
    },
    [patch],
  );

  const dismiss = useCallback((id: string) => setTasks((current) => current.filter((task) => task.id !== id)), []);
  const clearFinished = useCallback(
    () => setTasks((current) => current.filter((task) => !["done", "error", "cancelled"].includes(task.status))),
    [],
  );

  const isBusy = tasks.some((task) => ["queued", "uploading", "processing"].includes(task.status));

  return { tasks, enqueue, cancel, dismiss, clearFinished, isBusy };
}
