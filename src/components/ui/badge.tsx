import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const TONES = {
  neutral: "bg-canvas text-body ring-line",
  success: "bg-success-soft text-success ring-success/20",
  warning: "bg-warning-soft text-warning ring-warning/20",
  danger: "bg-danger-soft text-danger ring-danger/20",
  accent: "bg-accent-soft text-accent-strong ring-accent/20",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
