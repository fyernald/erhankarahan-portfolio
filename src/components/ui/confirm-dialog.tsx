"use client";

import { useState, type ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { overlayClassName } from "./dialog";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  /** Async work to run on confirm; the dialog shows a spinner and stays open until it settles. */
  onConfirm: () => Promise<boolean | void>;
  tone?: "danger" | "primary";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  tone = "danger",
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      const shouldClose = await onConfirm();
      if (shouldClose !== false) onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={overlayClassName} />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-6 shadow-popover data-[state=open]:animate-fade-up">
          <div className="flex gap-4">
            {tone === "danger" && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                <AlertTriangle className="size-5" />
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              <AlertDialog.Title className="text-base font-bold text-ink">{title}</AlertDialog.Title>
              <AlertDialog.Description className="text-sm leading-relaxed text-body">{description}</AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button variant={tone === "danger" ? "danger" : "primary"} loading={pending} onClick={handleConfirm}>
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
