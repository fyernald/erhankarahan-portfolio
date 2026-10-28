import type { MediaKind } from "./types";

type FileTypeRule = {
  kind: MediaKind;
  mimeType: string;
  /** Extensions a user-supplied filename may carry for this content. */
  extensions: readonly string[];
};

/**
 * The allow-list. A file is accepted only if the type detected from its *bytes*
 * appears here and the filename extension agrees with it. SVG, HTML, archives and
 * executables are intentionally absent.
 */
export const FILE_TYPE_RULES: readonly FileTypeRule[] = [
  { kind: "image", mimeType: "image/jpeg", extensions: ["jpg", "jpeg"] },
  { kind: "image", mimeType: "image/png", extensions: ["png"] },
  { kind: "image", mimeType: "image/webp", extensions: ["webp"] },
  { kind: "image", mimeType: "image/gif", extensions: ["gif"] },
  { kind: "image", mimeType: "image/avif", extensions: ["avif"] },
  { kind: "video", mimeType: "video/mp4", extensions: ["mp4", "m4v"] },
  { kind: "video", mimeType: "video/x-m4v", extensions: ["m4v", "mp4"] },
  { kind: "video", mimeType: "video/quicktime", extensions: ["mov"] },
  { kind: "video", mimeType: "video/webm", extensions: ["webm"] },
  { kind: "document", mimeType: "application/pdf", extensions: ["pdf"] },
  {
    kind: "document",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
  },
  {
    kind: "document",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
  },
  {
    kind: "document",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extensions: ["pptx"],
  },
];

export function findRuleByMime(mimeType: string): FileTypeRule | undefined {
  return FILE_TYPE_RULES.find((rule) => rule.mimeType === mimeType);
}

/** Value for an `<input accept>` attribute restricted to the given kinds. */
export function acceptAttributeFor(kinds: readonly MediaKind[]): string {
  return FILE_TYPE_RULES.filter((rule) => kinds.includes(rule.kind))
    .flatMap((rule) => [rule.mimeType, ...rule.extensions.map((ext) => `.${ext}`)])
    .join(",");
}

export function extensionOf(filename: string): string {
  const match = /\.([a-z0-9]{1,8})$/i.exec(filename);
  return match ? match[1].toLowerCase() : "";
}

export const STORAGE_FOLDERS: Record<MediaKind | "poster", string> = {
  image: "images",
  video: "videos",
  document: "documents",
  poster: "posters",
};
