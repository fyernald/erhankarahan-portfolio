import "server-only";
import { and, arrayContains, count, desc, eq, ilike, ne, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { paginate, type Paginated } from "@/lib/utils/pagination";
import { toPostDetail, toPostListItem } from "./mappers";
import type { PostDetail, PostListItem, PostStatus } from "./types";

const publishedOnly = eq(posts.status, "published");

/* ----------------------------- Dashboard ----------------------------- */

export async function listPostsForAdmin(filters: { status?: PostStatus; search?: string }): Promise<PostListItem[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(posts.status, filters.status));
  if (filters.search) conditions.push(ilike(posts.title, `%${escapeLike(filters.search)}%`));

  const rows = await getDb().query.posts.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: { cover: true },
    orderBy: [desc(posts.updatedAt)],
    limit: 200,
  });
  return rows.map(toPostListItem);
}

export async function getPostForEdit(id: string): Promise<PostDetail | null> {
  const row = await getDb().query.posts.findFirst({ where: eq(posts.id, id), with: { cover: true } });
  return row ? toPostDetail(row) : null;
}

/* ----------------------------- Public site ----------------------------- */

export async function listPublishedPosts(options: {
  page: number;
  pageSize: number;
  tag?: string;
}): Promise<Paginated<PostListItem>> {
  const where = options.tag ? and(publishedOnly, arrayContains(posts.tags, [options.tag])) : publishedOnly;
  const db = getDb();
  const [rows, [{ total }]] = await Promise.all([
    db.query.posts.findMany({
      where,
      with: { cover: true },
      orderBy: [desc(posts.publishedAt)],
      limit: options.pageSize,
      offset: (options.page - 1) * options.pageSize,
    }),
    db.select({ total: count() }).from(posts).where(where),
  ]);
  return paginate(rows.map(toPostListItem), total, options.page, options.pageSize);
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  const row = await getDb().query.posts.findFirst({
    where: and(publishedOnly, eq(posts.slug, slug)),
    with: { cover: true },
  });
  return row ? toPostDetail(row) : null;
}

export async function listRelatedPosts(post: PostListItem, limit = 3): Promise<PostListItem[]> {
  const sharesTag = post.tags.length ? sql`${posts.tags} && ${post.tags}::text[]` : sql`false`;
  const rows = await getDb().query.posts.findMany({
    where: and(publishedOnly, ne(posts.id, post.id)),
    with: { cover: true },
    orderBy: [sql`(${sharesTag}) desc`, desc(posts.publishedAt)],
    limit,
  });
  return rows.map(toPostListItem);
}

export async function listPublishedTags(): Promise<string[]> {
  const rows = await getDb()
    .select({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(publishedOnly);
  return Array.from(new Set(rows.map((row) => row.tag))).sort();
}

export async function listPublishedPostSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return getDb().select({ slug: posts.slug, updatedAt: posts.updatedAt }).from(posts).where(publishedOnly);
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
