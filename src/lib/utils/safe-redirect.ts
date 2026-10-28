const DEFAULT_REDIRECT = "/dashboard";

/** Only allows relative dashboard paths, preventing open-redirects via `?next=`. */
export function safeDashboardRedirect(target: string | string[] | undefined | null): string {
  const value = Array.isArray(target) ? target[0] : target;
  if (!value || !value.startsWith("/dashboard") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_REDIRECT;
  }
  return value;
}
