import { format, formatDistanceToNowStrict } from "date-fns";

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : fractionDigits)} ${BYTE_UNITS[exponent]}`;
}

export function formatDate(value: Date | string | null | undefined, pattern = "MMM d, yyyy"): string {
  if (!value) return "—";
  return format(typeof value === "string" ? new Date(value) : value, pattern);
}

export function formatRelative(value: Date | string): string {
  return `${formatDistanceToNowStrict(typeof value === "string" ? new Date(value) : value)} ago`;
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds < 0) return "0:00";
  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/** "2019 — Present" style range used by the CV timeline. */
export function formatDateRange(start: string, end: string | null): string {
  const startLabel = formatDate(start, "MMM yyyy");
  if (end && formatDate(end, "MMM yyyy") === startLabel) return startLabel;
  return `${startLabel} — ${end ? formatDate(end, "MMM yyyy") : "Present"}`;
}
