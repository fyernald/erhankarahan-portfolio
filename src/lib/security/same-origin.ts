import "server-only";
import { env } from "@/lib/env";

/**
 * CSRF defence for route handlers that mutate state: the browser always sends
 * `Origin` on cross-origin POSTs, so we require it to match our own origin.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(env().APP_URL).origin;
  } catch {
    return false;
  }
}
