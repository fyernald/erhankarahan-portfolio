import { isValidYoutubeUrl } from "@tiptap/extension-youtube";

export function validateLinkUrl(value: string): string | null {
  if (!value) return "Enter a link";
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? null : "Only http(s) and mailto links are allowed";
  } catch {
    return "Enter a full URL, e.g. https://example.com";
  }
}

export function validateYoutubeUrl(value: string): string | null {
  return isValidYoutubeUrl(value) ? null : "Enter a valid YouTube link";
}
