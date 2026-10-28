import "server-only";
import { fileTypeFromFile } from "file-type";
import { UploadError } from "./errors";
import { extensionOf, findRuleByMime } from "./policy";
import type { MediaKind, ReceivedFile, VerifiedFile } from "./types";

/**
 * Identifies a file by its magic bytes (never by the client-provided MIME type or
 * name) and checks it against the allow-list and the kinds this request accepts.
 */
export async function verifyFileType(file: ReceivedFile, acceptedKinds: readonly MediaKind[]): Promise<VerifiedFile> {
  const detected = await fileTypeFromFile(file.tempPath);
  const rule = detected ? findRuleByMime(detected.mime) : undefined;

  if (!detected || !rule) {
    throw new UploadError("This file type is not supported.", 415);
  }
  if (!acceptedKinds.includes(rule.kind)) {
    throw new UploadError(`Only ${acceptedKinds.join(", ")} files can be uploaded here.`, 415);
  }

  const claimedExtension = extensionOf(file.originalName);
  if (!rule.extensions.includes(claimedExtension)) {
    throw new UploadError("The file extension does not match the file contents.", 415);
  }

  return { ...file, kind: rule.kind, mimeType: rule.mimeType, extension: detected.ext };
}
