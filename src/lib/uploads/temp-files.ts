import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { env } from "@/lib/env";

/** Private working directory for in-flight uploads (mode 0700). */
export async function uploadTempDir(): Promise<string> {
  // Runtime-only paths: tell the bundler not to trace them.
  const dir = env().UPLOAD_TMP_DIR ?? path.join(/*turbopackIgnore: true*/ tmpdir(), "ek-uploads");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}

export async function tempFilePath(extension = "bin"): Promise<string> {
  return path.join(/*turbopackIgnore: true*/ await uploadTempDir(), `${randomUUID()}.${extension}`);
}

/** Tracks temp files created during one upload so they are always removed. */
export class TempFileRegistry {
  private readonly paths = new Set<string>();

  async create(extension?: string): Promise<string> {
    const filePath = await tempFilePath(extension);
    this.paths.add(filePath);
    return filePath;
  }

  track(filePath: string) {
    this.paths.add(filePath);
  }

  async cleanup() {
    await Promise.allSettled([...this.paths].map((filePath) => rm(filePath, { force: true })));
    this.paths.clear();
  }
}
