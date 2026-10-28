import "server-only";
import { env } from "@/lib/env";
import { ClamAvScanner } from "./clamav-scanner";
import { NoopScanner } from "./noop-scanner";
import type { MalwareScanner } from "./scanner";

/** clamd's default StreamMaxLength is 25 MB; larger files are skipped (videos are remuxed instead). */
const CLAMD_STREAM_LIMIT = 25 * 1024 * 1024;

export function createMalwareScanner(): MalwareScanner {
  const { CLAMAV_HOST, CLAMAV_PORT } = env();
  if (!CLAMAV_HOST) return new NoopScanner();
  return new ClamAvScanner({ host: CLAMAV_HOST, port: CLAMAV_PORT, maxScanBytes: CLAMD_STREAM_LIMIT });
}

export type { MalwareScanner, ScanResult } from "./scanner";
