"use client";

import { useLayoutEffect, useRef } from "react";

/** Keeps a ref pointing at the latest value so stable callbacks can read fresh props. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
