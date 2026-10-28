import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { buildContentSecurityPolicy } from "@/lib/security/csp";

const DASHBOARD_PREFIX = "/dashboard";
const LOGIN_PATH = "/login";

/**
 * Runs before every page render:
 * 1. Generates a per-request CSP nonce (consumed automatically by Next.js scripts).
 * 2. Performs an *optimistic* auth redirect for the dashboard based on the presence
 *    of the session cookie. The authoritative check happens on the server inside
 *    the dashboard layout and in every server action / route handler.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith(DASHBOARD_PREFIX) && !getSessionCookie(request)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // API routes and media are excluded: they must stream large bodies untouched
      // and they set their own headers.
      source: "/((?!api|media|_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
