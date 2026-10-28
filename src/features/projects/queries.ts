import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { toProjectDetail, toProjectListItem } from "./mappers";
import type { ProjectDetail, ProjectListItem } from "./types";

const publishedOnly = eq(projects.status, "published");
const displayOrder = [asc(projects.sortOrder), desc(projects.year), desc(projects.createdAt)];
const withMedia = { cover: true, gallery: { with: { media: true } } } as const;

export async function listProjectsForAdmin(): Promise<ProjectListItem[]> {
  const rows = await getDb().query.projects.findMany({ with: { cover: true }, orderBy: displayOrder });
  return rows.map(toProjectListItem);
}

export async function getProjectForEdit(id: string): Promise<ProjectDetail | null> {
  const row = await getDb().query.projects.findFirst({ where: eq(projects.id, id), with: withMedia });
  return row ? toProjectDetail(row) : null;
}

export async function listPublishedProjects(options: { category?: string; featuredOnly?: boolean; limit?: number } = {}) {
  const conditions = [publishedOnly];
  if (options.category) conditions.push(eq(projects.category, options.category));
  if (options.featuredOnly) conditions.push(eq(projects.featured, true));

  const rows = await getDb().query.projects.findMany({
    where: and(...conditions),
    with: { cover: true },
    orderBy: options.featuredOnly ? displayOrder : [desc(projects.featured), ...displayOrder],
    limit: options.limit,
  });
  return rows.map(toProjectListItem);
}

export async function listPublishedCategories(): Promise<string[]> {
  const rows = await getDb()
    .selectDistinct({ category: projects.category })
    .from(projects)
    .where(publishedOnly)
    .orderBy(asc(projects.category));
  return rows.map((row) => row.category);
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const row = await getDb().query.projects.findFirst({
    where: and(publishedOnly, eq(projects.slug, slug)),
    with: withMedia,
  });
  return row ? toProjectDetail(row) : null;
}

/** Previous/next project in display order for the detail page footer. */
export async function getAdjacentProjects(slug: string) {
  const all = await getDb()
    .select({ slug: projects.slug, title: projects.title })
    .from(projects)
    .where(publishedOnly)
    .orderBy(...displayOrder);
  const index = all.findIndex((project) => project.slug === slug);
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index >= 0 && index < all.length - 1 ? all[index + 1] : null,
  };
}

export async function listPublishedProjectSlugs() {
  return getDb().select({ slug: projects.slug, updatedAt: projects.updatedAt }).from(projects).where(publishedOnly);
}

export async function nextProjectSortOrder(): Promise<number> {
  const [row] = await getDb().select({ max: sql<number>`coalesce(max(${projects.sortOrder}), -1)` }).from(projects);
  return Number(row.max) + 1;
}

export async function listProjectCategories(): Promise<string[]> {
  const rows = await getDb().selectDistinct({ category: projects.category }).from(projects).orderBy(asc(projects.category));
  return rows.map((row) => row.category);
}
