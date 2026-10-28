import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

// The auth instance is created lazily so `next build` does not need runtime secrets.
export function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}
