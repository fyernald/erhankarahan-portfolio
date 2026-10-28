"use client";

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FieldProps = {
  label: string;
  /** Errors from server-side validation (`fieldErrors[name]`). */
  error?: string | string[];
  hint?: ReactNode;
  className?: string;
  /** Renders the label visually hidden while keeping it accessible. */
  hideLabel?: boolean;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
};

/** Label + control + hint/error wiring with proper aria attributes. */
export function Field({ label, error, hint, className, hideLabel, children }: FieldProps) {
  const id = useId();
  const message = Array.isArray(error) ? error[0] : error;
  const describedBy = message ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": Boolean(message) || undefined, "aria-describedby": describedBy })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-[13px] font-semibold text-ink", hideLabel && "sr-only")}>
        {label}
      </label>
      {control}
      {message ? (
        <p id={`${id}-error`} className="animate-fade-in text-xs font-medium text-danger">
          {message}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
