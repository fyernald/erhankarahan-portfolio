import "server-only";
import { createReadStream } from "node:fs";
import net from "node:net";
import type { MalwareScanner, ScanResult } from "./scanner";

const CHUNK_SIZE = 64 * 1024;
const TIMEOUT_MS = 120_000;

type ClamAvOptions = { host: string; port: number; maxScanBytes: number };

/**
 * Streams a file to `clamd` using the INSTREAM protocol:
 * `zINSTREAM\0` followed by `<uint32 length><bytes>` chunks and a zero-length terminator.
 */
export class ClamAvScanner implements MalwareScanner {
  readonly name = "clamav";

  constructor(private readonly options: ClamAvOptions) {}

  async scan(filePath: string, sizeBytes: number): Promise<ScanResult> {
    if (sizeBytes > this.options.maxScanBytes) {
      return { status: "skipped", reason: "File exceeds the scanner's stream limit" };
    }
    const reply = await this.instream(filePath);
    return parseReply(reply);
  }

  private instream(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.options.host, port: this.options.port });
      const responseChunks: Buffer[] = [];
      socket.setTimeout(TIMEOUT_MS, () => socket.destroy(new Error("ClamAV scan timed out")));
      socket.on("data", (chunk) => responseChunks.push(chunk));
      socket.on("error", reject);
      socket.on("close", () => resolve(Buffer.concat(responseChunks).toString("utf8")));

      socket.on("connect", () => {
        socket.write("zINSTREAM\0");
        const file = createReadStream(filePath, { highWaterMark: CHUNK_SIZE });
        file.on("data", (chunk) => {
          const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
          const header = Buffer.alloc(4);
          header.writeUInt32BE(buffer.length, 0);
          if (!socket.write(Buffer.concat([header, buffer]))) {
            file.pause();
            socket.once("drain", () => file.resume());
          }
        });
        file.on("end", () => socket.end(Buffer.alloc(4)));
        file.on("error", (error) => socket.destroy(error));
      });
    });
  }
}

export function parseReply(reply: string): ScanResult {
  const message = reply.replace(/\0/g, "").trim();
  if (/:\s*OK$/.test(message)) return { status: "clean" };
  const infected = /:\s*(.+)\s+FOUND$/.exec(message);
  if (infected) return { status: "infected", signature: infected[1] };
  throw new Error(`Unexpected ClamAV response: ${message || "<empty>"}`);
}
