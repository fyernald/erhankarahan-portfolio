import type { media, projectMedia, projects } from "@/lib/db/schema";
import { toMediaItem, toMediaItemOrNull } from "@/features/media/mappers";
import type { ProjectDetail, ProjectListItem } from "./types";

type MediaRow = typeof media.$inferSelect;
type ProjectRow = typeof projects.$inferSelect & {
  cover?: MediaRow | null;
  gallery?: (typeof projectMedia.$inferSelect & { media: MediaRow })[];
};

export function toProjectListItem(row: ProjectRow): ProjectListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    summary: row.summary,
    client: row.client,
    year: row.year,
    status: row.status,
    featured: row.featured,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
    cover: toMediaItemOrNull(row.cover),
  };
}

export function toProjectDetail(row: ProjectRow): ProjectDetail {
  const gallery = [...(row.gallery ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => toMediaItem(item.media));
  return { ...toProjectListItem(row), content: row.content, contentHtml: row.contentHtml, gallery };
}
