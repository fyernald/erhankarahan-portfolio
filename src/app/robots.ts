import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "https://erhankarahan.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/login", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
