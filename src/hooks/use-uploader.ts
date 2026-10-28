"use client";

import { useCallback, useEffect, useId, useMemo, useSyncExternalStore } from "react";
import type { MediaItem } from "@/features/media/types";
import { isUploadActive, uploadManager, type UploadTask } from "@/lib/uploads/client/upload-manager";
import type { MediaKind } from "@/lib/uploads/types";
import { useLatest } from "./use-latest";

export type { UploadStatus, UploadTask } from "@/lib/uploads/client/upload-manager";

type UploaderOptions = {
  kinds?: readonly MediaKind[];
  /**
   * "own" (default): only uploads started by this component, and `onUploaded` only for those.
   * "all": every upload in the tab, e.g. for the media library.
   */
  scope?: "own" | "all";
  onUploaded?: (item: MediaItem) => void;
};

/** Every upload in the tab, for UI that summarises them (the upload tray). */
export function useUploadTasks(): readonly UploadTask[] {
  return useSyncExternalStore(uploadManager.subscribe, uploadManager.getSnapshot, uploadManager.getServerSnapshot);
}

/**
 * A component's view of the tab-wide upload queue (`uploadManager`): per-file progress,
 * phases, cancellation and a concurrency limit. Uploads outlive the component, so
 * leaving the page or a refresh never cancels them; `onUploaded` simply stops firing
 * once the component unmounts.
 */
export function useUploader({ kinds, scope = "own", onUploaded }: UploaderOptions = {}) {
  const owner = useId();
  const onUploadedRef = useLatest(onUploaded);
  const allTasks = useUploadTasks();
  const tasks = useMemo(
    () => (scope === "all" ? allTasks : allTasks.filter((task) => task.owner === owner)),
    [allTasks, owner, scope],
  );

  useEffect(
    () =>
      uploadManager.onUploaded((item, task) => {
        if (scope === "all" || task.owner === owner) onUploadedRef.current?.(item);
      }),
    [onUploadedRef, owner, scope],
  );

  const enqueue = useCallback((files: File[] | FileList) => uploadManager.enqueue(files, { kinds, owner }), [kinds, owner]);
  const cancel = useCallback((id: string) => uploadManager.cancel(id), []);
  const dismiss = useCallback((id: string) => uploadManager.dismiss(id), []);
  const clearFinished = useCallback(() => uploadManager.dismissFinished(scope === "all" ? undefined : owner), [owner, scope]);

  const isBusy = tasks.some(isUploadActive);

  return { tasks, enqueue, cancel, dismiss, clearFinished, isBusy };
}
