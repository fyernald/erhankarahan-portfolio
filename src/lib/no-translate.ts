/**
 * Browser translation (e.g. Chrome's built-in Google Translate) swaps text nodes for
 * its own, and React crashes with `NotFoundError: Failed to execute 'insertBefore'`
 * as soon as it updates them. The dashboard and sign-in page are interactive admin
 * tools, so they opt out; the public site stays translatable.
 *
 * The proxy flags matching requests with this header and the root layout marks
 * `<html translate="no">`, which is decided on the first page load.
 */
export const NO_TRANSLATE_HEADER = "x-no-translate";

export function isNoTranslatePath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
