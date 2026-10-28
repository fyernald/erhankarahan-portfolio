import type { MetadataRoute } from "next";

// Rendered per request: depends on the database and on the runtime APP_URL.
export const dynamic = "force-dynamic";
import { listPublishedPostSlugs } from "@/features/posts/queries";
import { listPublishedProjectSlugs } from "@/features/projects/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "https://erhankarahan.com";
  const [posts, projects] = await Promise.all([listPublishedPostSlugs(), listPublishedProjectSlugs()]);
  const staticPages = ["", "/about", "/portfolio", "/blog", "/contact"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...projects.map((project) => ({ url: `${base}/portfolio/${project.slug}`, lastModified: project.updatedAt, priority: 0.7 })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt, priority: 0.6 })),
  ];
}
