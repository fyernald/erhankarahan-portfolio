import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const controlClassName = cn(
  "w-full rounded-control border border-line bg-surface px-3.5 text-sm text-ink placeholder:text-muted",
  "transition-[border-color,box-shadow] duration-150 outline-none",
  "focus:border-ink focus:ring-4 focus:ring-ink/5",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10",
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70",
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(controlClassName, "h-10", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(controlClassName, "resize-y py-2.5 leading-relaxed", className)} {...props} />;
});
