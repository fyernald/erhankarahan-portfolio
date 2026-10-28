import type { NextConfig } from "next";

/**
 * Static security headers applied to every response. The Content-Security-Policy
 * is nonce-based and therefore generated per request in `src/proxy.ts`.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Cache Components is disabled on purpose: almost every page reads the database
  // and the CSP nonce, so request-time rendering is the simpler, safer model here.
  cacheComponents: false,
  // `file-type` is kept external so it and `strtok3` share one module instance.
  serverExternalPackages: ["sharp", "pg", "busboy", "yauzl", "file-type"],
  // `file-type` loads `strtok3` (for `fileTypeFromFile`) through a non-literal
  // dynamic import that the standalone tracer cannot follow, so ship it explicitly.
  outputFileTracingIncludes: {
    "/api/uploads": ["./node_modules/strtok3/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // All media is served from our own `/media/*` route handler.
    localPatterns: [{ pathname: "/media/**" }],
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
