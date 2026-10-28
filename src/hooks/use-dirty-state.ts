"use client";

import { useCallback, useState } from "react";

/**
 * Tracks whether a form has unsaved edits. `track(setter)` wraps any state setter
 * so calling it also marks the form dirty.
 */
export function useDirtyState() {
  const [dirty, setDirty] = useState(false);
  const track = useCallback(
    <T,>(setter: (value: T) => void) =>
      (value: T) => {
        setter(value);
        setDirty(true);
      },
    [],
  );
  return { dirty, setDirty, track };
}
