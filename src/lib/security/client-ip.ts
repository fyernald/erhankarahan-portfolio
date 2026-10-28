import "server-only";
import { createHmac } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Resolves the client IP. The reverse proxy (Caddy or nginx) overwrites `X-Real-IP`,
 * so it is trusted first; the left-most `X-Forwarded-For` entry is a fallback.
 */
export function getClientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

export function hashIp(ip: string): string {
  return createHmac("sha256", env().IP_HASH_SECRET).update(ip).digest("hex");
}
