"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      // Stack above the upload tray while it is open (it sets --upload-tray-height).
      offset={{ bottom: "calc(24px + var(--upload-tray-height, 0px))" }}
      mobileOffset={{ bottom: "calc(16px + var(--upload-tray-height, 0px))" }}
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
