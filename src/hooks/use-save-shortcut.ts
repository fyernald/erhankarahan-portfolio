"use client";

import { useEffect } from "react";
import { useLatest } from "./use-latest";

/** Calls `onSave` on Ctrl/Cmd + S. */
export function useSaveShortcut(onSave: () => void) {
  const callback = useLatest(onSave);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        callback.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback]);
}
