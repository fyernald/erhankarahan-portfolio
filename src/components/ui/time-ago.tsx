import { formatDate, formatRelative } from "@/lib/utils/format";

type TimeAgoProps = { date: string; mode?: "relative" | "absolute"; pattern?: string; className?: string };

/**
 * Renders a timestamp. Relative times and local timezones differ between the server
 * render and the browser, so the text is allowed to update during hydration.
 */
export function TimeAgo({ date, mode = "relative", pattern = "MMM d, yyyy 'at' HH:mm", className }: TimeAgoProps) {
  return (
    <time dateTime={date} title={formatDate(date, "PPpp")} className={className} suppressHydrationWarning>
      {mode === "relative" ? formatRelative(date) : formatDate(date, pattern)}
    </time>
  );
}
