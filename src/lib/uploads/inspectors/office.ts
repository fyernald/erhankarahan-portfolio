import yauzl, { type Entry, type ZipFile } from "yauzl";
import { UploadError } from "../errors";

const MAX_ENTRIES = 5_000;
const MAX_TOTAL_UNCOMPRESSED = 512 * 1024 * 1024;
const MAX_COMPRESSION_RATIO = 200;
const MAX_RELS_BYTES = 2 * 1024 * 1024;

/** Entries that only exist in documents carrying macros, ActiveX or embedded OLE objects. */
const FORBIDDEN_ENTRY = /(^|\/)(vbaProject\.bin|vbaData\.xml|activeX\/|embeddings\/|oleObject\d*\.bin)/i;
/** Relationship types that make Office fetch remote content (template injection, OLE links). */
const EXTERNAL_REL = /TargetMode\s*=\s*"External"/i;
const RISKY_EXTERNAL_TYPE = /Type\s*=\s*"[^"]*\/(attachedTemplate|oleObject|subDocument|frame|externalLinkPath)"/i;

function openZip(filePath: string): Promise<ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true, strictFileNames: true, validateEntrySizes: true }, (error, zip) =>
      error || !zip ? reject(error ?? new Error("Cannot open zip")) : resolve(zip),
    );
  });
}

function readEntry(zip: ZipFile, entry: Entry): Promise<string> {
  return new Promise((resolve, reject) => {
    zip.openReadStream(entry, (error, stream) => {
      if (error || !stream) return reject(error ?? new Error("Cannot read entry"));
      const chunks: Buffer[] = [];
      let size = 0;
      stream.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_RELS_BYTES) stream.destroy(new Error("Relationship part too large"));
        else chunks.push(chunk);
      });
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      stream.on("error", reject);
    });
  });
}

/**
 * Inspects OOXML (docx/xlsx/pptx) packages: rejects macros, ActiveX, embedded
 * objects, remote template injection and zip bombs.
 */
export async function inspectOfficeDocument(filePath: string): Promise<void> {
  let zip: ZipFile;
  try {
    zip = await openZip(filePath);
  } catch {
    throw new UploadError("The document is malformed.", 415);
  }

  try {
    await new Promise<void>((resolve, reject) => {
      let entries = 0;
      let totalUncompressed = 0;

      zip.on("entry", async (entry: Entry) => {
        try {
          entries += 1;
          totalUncompressed += entry.uncompressedSize;
          const ratio = entry.compressedSize > 0 ? entry.uncompressedSize / entry.compressedSize : 0;

          if (entries > MAX_ENTRIES || totalUncompressed > MAX_TOTAL_UNCOMPRESSED || ratio > MAX_COMPRESSION_RATIO) {
            throw new UploadError("The document looks like a compression bomb.", 422);
          }
          if (FORBIDDEN_ENTRY.test(entry.fileName)) {
            throw new UploadError("Documents with macros, ActiveX controls or embedded objects are not allowed.", 422);
          }
          if (entry.fileName.endsWith(".rels")) {
            const xml = await readEntry(zip, entry);
            const risky = xml
              .split(/<Relationship\b/i)
              .some((rel) => EXTERNAL_REL.test(rel) && RISKY_EXTERNAL_TYPE.test(rel));
            if (risky) throw new UploadError("Documents that load remote templates or objects are not allowed.", 422);
          }
          zip.readEntry();
        } catch (error) {
          reject(error);
        }
      });
      zip.on("end", resolve);
      zip.on("error", () => reject(new UploadError("The document is malformed.", 415)));
      zip.readEntry();
    });
  } finally {
    zip.close();
  }
}
