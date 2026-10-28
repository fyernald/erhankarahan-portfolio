"use server";

import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import type { z } from "zod";
import { adminAction } from "@/lib/actions/admin-action";
import { NotFoundError } from "@/lib/actions/errors";
import { revalidateSite } from "@/lib/cache/revalidate";
import { getDb, type Database } from "@/lib/db";
import { projectMedia, projects } from "@/lib/db/schema";
import { uniqueSlug } from "@/lib/db/unique-slug";
import { renderRichText } from "@/lib/rich-text/render";
import { nextProjectSortOrder } from "./queries";
import { projectIdSchema, projectInputSchema, reorderProjectsSchema, updateProjectSchema } from "./schemas";

type ProjectValues = z.output<typeof projectInputSchema>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

function buildProjectRecord(input: ProjectValues, previousPublishedAt: Date | null) {
  const rendered = renderRichText(input.content as JSONContent);
  return {
    title: input.title,
    category: input.category,
    summary: input.summary,
    content: input.content,
    contentHtml: rendered.html,
    coverMediaId: input.coverMediaId,
    client: input.client,
    year: input.year,
    status: input.status,
    featured: input.featured,
    publishedAt: input.status === "published" ? (previousPublishedAt ?? new Date()) : previousPublishedAt,
  };
}

async function replaceGallery(tx: Transaction, projectId: string, mediaIds: string[]) {
  await tx.delete(projectMedia).where(eq(projectMedia.projectId, projectId));
  const unique = Array.from(new Set(mediaIds));
  if (unique.length === 0) return;
  await tx.insert(projectMedia).values(unique.map((mediaId, sortOrder) => ({ projectId, mediaId, sortOrder })));
}

export const createProject = adminAction(projectInputSchema, async (input) => {
  const slug = await uniqueSlug(projects, input.slug || input.title);
  const sortOrder = await nextProjectSortOrder();
  const created = await getDb().transaction(async (tx) => {
    const [row] = await tx
      .insert(projects)
      .values({ ...buildProjectRecord(input, null), slug, sortOrder })
      .returning({ id: projects.id, slug: projects.slug });
    await replaceGallery(tx, row.id, input.galleryMediaIds);
    return row;
  });
  revalidateSite();
  return created;
});

export const updateProject = adminAction(updateProjectSchema, async ({ id, ...input }) => {
  const db = getDb();
  const existing = await db.query.projects.findFirst({ where: eq(projects.id, id), columns: { publishedAt: true } });
  if (!existing) throw new NotFoundError("Project");

  const slug = await uniqueSlug(projects, input.slug || input.title, id);
  await db.transaction(async (tx) => {
    await tx
      .update(projects)
      .set({ ...buildProjectRecord(input, existing.publishedAt), slug })
      .where(eq(projects.id, id));
    await replaceGallery(tx, id, input.galleryMediaIds);
  });
  revalidateSite();
  return { id, slug };
});

export const reorderProjects = adminAction(reorderProjectsSchema, async ({ ids }) => {
  await getDb().transaction(async (tx) => {
    for (const [sortOrder, id] of ids.entries()) {
      await tx.update(projects).set({ sortOrder }).where(eq(projects.id, id));
    }
  });
  revalidateSite();
});

export const deleteProject = adminAction(projectIdSchema, async ({ id }) => {
  const deleted = await getDb().delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  if (deleted.length === 0) throw new NotFoundError("Project");
  revalidateSite();
});
