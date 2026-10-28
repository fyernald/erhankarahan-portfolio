import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { beforeAll, describe, expect, it } from "vitest";
import { inspectPdf } from "@/lib/uploads/inspectors/pdf";
import { parseReply } from "@/lib/uploads/scanners/clamav-scanner";
import { sanitizeFilename } from "@/lib/uploads/receive";
import { extensionOf, findRuleByMime } from "@/lib/uploads/policy";
import { STORAGE_KEY_PATTERN } from "@/lib/media/urls";

let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "ek-test-"));
});

async function pdf(name: string, content: Buffer | string) {
  const filePath = path.join(dir, name);
  await writeFile(filePath, content);
  return filePath;
}

describe("inspectPdf", () => {
  it("accepts a plain PDF", async () => {
    const file = await pdf("clean.pdf", "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
    await expect(inspectPdf(file)).resolves.toBeUndefined();
  });

  it("rejects JavaScript actions, including hex-escaped names", async () => {
    const file = await pdf("js.pdf", "%PDF-1.4\n1 0 obj<</OpenAction<</S/J#61vaScript/JS(x)>>>>endobj");
    await expect(inspectPdf(file)).rejects.toThrow(/active content/);
  });

  it("rejects active content hidden in compressed object streams", async () => {
    const inner = deflateSync(Buffer.from("<</S/Launch/F(cmd.exe)>>"));
    const content = Buffer.concat([Buffer.from("%PDF-1.5\n4 0 obj<</Filter/FlateDecode>>stream\n"), inner, Buffer.from("\nendstream")]);
    const file = await pdf("objstm.pdf", content);
    await expect(inspectPdf(file)).rejects.toThrow(/Launch/);
  });

  it("rejects files without a PDF header", async () => {
    const file = await pdf("fake.pdf", "<html>");
    await expect(inspectPdf(file)).rejects.toThrow(/malformed/);
  });
});

describe("sanitizeFilename", () => {
  it.each([
    ["../../etc/passwd", "passwd"],
    ["C:\\Users\\me\\photo.jpg", "photo.jpg"],
    ["evil\u202Egpj.exe", "evilgpj.exe"],
    ['a<b>:"c".pdf', "abc.pdf"],
    ["", "upload"],
  ])("%s → %s", (input, expected) => {
    expect(sanitizeFilename(input)).toBe(expected);
  });
});

describe("file type policy", () => {
  it("does not allow SVG or HTML", () => {
    expect(findRuleByMime("image/svg+xml")).toBeUndefined();
    expect(findRuleByMime("text/html")).toBeUndefined();
  });

  it("reads extensions case-insensitively", () => {
    expect(extensionOf("Photo.JPEG")).toBe("jpeg");
    expect(extensionOf("noext")).toBe("");
  });
});

describe("storage key pattern", () => {
  it("only accepts server-generated keys", () => {
    expect(STORAGE_KEY_PATTERN.test("images/123e4567-e89b-12d3-a456-426614174000.jpg")).toBe(true);
    expect(STORAGE_KEY_PATTERN.test("../secrets.txt")).toBe(false);
    expect(STORAGE_KEY_PATTERN.test("images/../../x.jpg")).toBe(false);
  });
});

describe("ClamAV reply parser", () => {
  it("parses clean and infected replies", () => {
    expect(parseReply("stream: OK\0")).toEqual({ status: "clean" });
    expect(parseReply("stream: Eicar-Test-Signature FOUND\0")).toEqual({
      status: "infected",
      signature: "Eicar-Test-Signature",
    });
    expect(() => parseReply("INSTREAM size limit exceeded. ERROR")).toThrow();
  });
});
