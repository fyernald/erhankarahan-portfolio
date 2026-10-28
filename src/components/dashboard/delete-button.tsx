"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button, type ButtonSize } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteButtonProps = {
  title: string;
  description: ReactNode;
  onConfirm: () => Promise<boolean | void>;
  label?: string;
  size?: ButtonSize;
};

/** Destructive button that always asks for confirmation and shows progress while deleting. */
export function DeleteButton({ title, description, onConfirm, label = "Delete", size = "md" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size={size} className="text-danger hover:bg-danger-soft hover:text-danger" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" /> {label}
      </Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} title={title} description={description} onConfirm={onConfirm} />
    </>
  );
}
