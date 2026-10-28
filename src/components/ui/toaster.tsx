"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border-line !font-sans !shadow-popover",
          title: "!text-ink !font-semibold",
          description: "!text-body",
        },
      }}
    />
  );
}
