export type ScanResult =
  | { status: "clean" }
  | { status: "infected"; signature: string }
  | { status: "skipped"; reason: string };

/** Strategy interface for malware scanning so engines can be swapped or disabled. */
export interface MalwareScanner {
  readonly name: string;
  scan(filePath: string, sizeBytes: number): Promise<ScanResult>;
}
