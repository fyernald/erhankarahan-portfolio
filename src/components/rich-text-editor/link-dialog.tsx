"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type LinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  placeholder: string;
  initialValue?: string;
  /** Returns an error message, or null when the value is accepted. */
  validate: (value: string) => string | null;
  onSubmit: (value: string) => void;
  onRemove?: () => void;
};

/** Small single-field dialog used for links and video embeds. */
export function LinkDialog({ open, onOpenChange, title, ...formProps }: LinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} size="sm">
      {/* Content unmounts while closed, so the form state resets on every open. */}
      <LinkForm {...formProps} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

type LinkFormProps = Omit<LinkDialogProps, "open" | "onOpenChange" | "title"> & { onClose: () => void };

function LinkForm({ label, placeholder, initialValue = "", validate, onSubmit, onRemove, onClose }: LinkFormProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    const problem = validate(trimmed);
    if (problem) return setError(problem);
    onSubmit(trimmed);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label={label} error={error ?? undefined}>
        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} autoFocus />
      </Field>
      <div className="flex justify-end gap-2">
        {onRemove && initialValue && (
          <Button
            variant="ghost"
            className="mr-auto text-danger hover:text-danger"
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            Remove link
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}
