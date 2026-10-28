"use server";

import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { adminAction } from "@/lib/actions/admin-action";
import { NotFoundError } from "@/lib/actions/errors";
import { revalidateSite } from "@/lib/cache/revalidate";
import { getDb } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { uniqueSlug } from "@/lib/db/unique-slug";
import { renderRichText } from "@/lib/rich-text/render";
import { truncate } from "@/lib/utils/text";
import { postIdSchema, postInputSchema, postStatusSchema, updatePostSchema } from "./schemas";
import type { z } from "zod";

type PostValues = z.output<typeof postInputSchema>;

/** Derives every computed column (HTML, reading time, excerpt fallback) from the input. */
function buildPostRecord(input: PostValues, previousPublishedAt: Date | null) {
  const rendered = renderRichText(input.content as JSONContent);
  return {
    title: input.title,
    excerpt: input.excerpt || truncate(rendered.plainText, 220),
    content: input.content,
    contentHtml: rendered.html,
    readingMinutes: rendered.readingMinutes,
    coverMediaId: input.coverMediaId,
    tags: Array.from(new Set(input.tags)),
    status: input.status,
    publishedAt: input.status === "published" ? (previousPublishedAt ?? new Date()) : previousPublishedAt,
  };
}

export const createPost = adminAction(postInputSchema, async (input, { user }) => {
  const slug = await uniqueSlug(posts, input.slug || input.title);
  const [created] = await getDb()
    .insert(posts)
    .values({ ...buildPostRecord(input, null), slug, authorId: user.id })
    .returning({ id: posts.id, slug: posts.slug });
  revalidateSite();
  return created;
});

export const updatePost = adminAction(updatePostSchema, async ({ id, ...input }) => {
  const db = getDb();
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id), columns: { publishedAt: true } });
  if (!existing) throw new NotFoundError("Post");

  const slug = await uniqueSlug(posts, input.slug || input.title, id);
  await db
    .update(posts)
    .set({ ...buildPostRecord(input, existing.publishedAt), slug })
    .where(eq(posts.id, id));
  revalidateSite();
  return { id, slug };
});

export const setPostStatus = adminAction(postStatusSchema, async ({ id, status }) => {
  const db = getDb();
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id), columns: { publishedAt: true } });
  if (!existing) throw new NotFoundError("Post");
  await db
    .update(posts)
    .set({ status, publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt })
    .where(eq(posts.id, id));
  revalidateSite();
});

export const deletePost = adminAction(postIdSchema, async ({ id }) => {
  const deleted = await getDb().delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
  if (deleted.length === 0) throw new NotFoundError("Post");
  revalidateSite();
});
