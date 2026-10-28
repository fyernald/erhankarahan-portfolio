import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { UploadError } from "../errors";

/**
 * PDF name tokens that enable active content: scripts, launching programs,
 * embedded files, forms that phone home, rich media (Flash) and XFA.
 */
const DANGEROUS_NAMES = [
  "JavaScript",
  "JS",
  "Launch",
  "EmbeddedFile",
  "EmbeddedFiles",
  "RichMedia",
  "XFA",
  "SubmitForm",
  "ImportData",
  "GoToE",
  "GoToR",
] as const;

const DANGEROUS_PATTERN = new RegExp(`/(?:${DANGEROUS_NAMES.join("|")})(?![A-Za-z0-9])`);
const STREAM_PATTERN = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
const MAX_INFLATED_BYTES_PER_STREAM = 32 * 1024 * 1024;
const MAX_TOTAL_INFLATED_BYTES = 256 * 1024 * 1024;

/** PDF allows `#xx` hex escapes inside names (`/J#61vaScript`); decode them first. */
function decodeNameEscapes(text: string): string {
  return text.replace(/#([0-9a-fA-F]{2})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

function containsActiveContent(text: string): string | undefined {
  return DANGEROUS_PATTERN.exec(decodeNameEscapes(text))?.[0];
}

/**
 * Rejects PDFs carrying active content. Object streams (PDF 1.5+) can hide
 * dictionaries inside Flate-compressed data, so every compressed stream is
 * inflated (with a decompression-bomb budget) and inspected as well.
 */
export async function inspectPdf(filePath: string): Promise<void> {
  const buffer = await readFile(filePath);
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new UploadError("The PDF file is malformed.", 415);
  }

  const raw = buffer.toString("latin1");
  const finding = containsActiveContent(raw);
  if (finding) throw activeContentError(finding);

  let inflatedTotal = 0;
  for (const match of raw.matchAll(STREAM_PATTERN)) {
    const data = Buffer.from(match[1], "latin1");
    let inflated: Buffer;
    try {
      inflated = inflateSync(data, { maxOutputLength: MAX_INFLATED_BYTES_PER_STREAM });
    } catch {
      continue; // Not Flate data (images, fonts with other filters) – nothing to inspect.
    }
    inflatedTotal += inflated.length;
    if (inflatedTotal > MAX_TOTAL_INFLATED_BYTES) {
      throw new UploadError("The PDF is too complex to be verified safely.", 422);
    }
    const nested = containsActiveContent(inflated.toString("latin1"));
    if (nested) throw activeContentError(nested);
  }
}

function activeContentError(token: string) {
  return new UploadError(`PDF rejected: it contains active content (${token}). Please export a plain PDF.`, 422);
}
