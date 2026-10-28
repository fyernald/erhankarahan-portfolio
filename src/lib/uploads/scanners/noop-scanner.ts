import type { MalwareScanner, ScanResult } from "./scanner";

/** Used when no antivirus daemon is configured (e.g. local development). */
export class NoopScanner implements MalwareScanner {
  readonly name = "none";

  async scan(): Promise<ScanResult> {
    return { status: "skipped", reason: "No malware scanner configured" };
  }
}
