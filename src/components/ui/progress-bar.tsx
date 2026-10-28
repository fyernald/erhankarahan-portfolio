import { cn } from "@/lib/utils/cn";

type ProgressBarProps = {
  /** 0-100. Omit for an indeterminate bar (e.g. while the server processes a file). */
  value?: number;
  tone?: "ink" | "success" | "danger";
  className?: string;
};

const TONES = { ink: "bg-ink", success: "bg-success", danger: "bg-danger" } as const;

export function ProgressBar({ value, tone = "ink", className }: ProgressBarProps) {
  const indeterminate = value === undefined;
  return (
    <div
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-out",
          TONES[tone],
          indeterminate && "absolute w-2/5 animate-progress-indeterminate",
        )}
        style={indeterminate ? undefined : { width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
