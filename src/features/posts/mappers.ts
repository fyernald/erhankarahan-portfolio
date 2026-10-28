import type { media, posts } from "@/lib/db/schema";
import { toMediaItemOrNull } from "@/features/media/mappers";
import type { PostDetail, PostListItem } from "./types";

type PostRow = typeof posts.$inferSelect & { cover?: typeof media.$inferSelect | null };

export function toPostListItem(row: PostRow): PostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    status: row.status,
    tags: row.tags,
    readingMinutes: row.readingMinutes,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    cover: toMediaItemOrNull(row.cover),
  };
}

export function toPostDetail(row: PostRow): PostDetail {
  return { ...toPostListItem(row), content: row.content, contentHtml: row.contentHtml };
}
