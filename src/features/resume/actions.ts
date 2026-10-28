"use server";

import { eq, sql } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { adminAction } from "@/lib/actions/admin-action";
import { NotFoundError } from "@/lib/actions/errors";
import { revalidateSite } from "@/lib/cache/revalidate";
import { getDb } from "@/lib/db";
import { experiences, skills } from "@/lib/db/schema";
import {
  experienceInputSchema,
  reorderSchema,
  resumeIdSchema,
  skillInputSchema,
  updateExperienceSchema,
  updateSkillSchema,
} from "./schemas";

type OrderedTable = PgTable & { id: PgColumn; sortOrder: PgColumn };

async function nextSortOrder(table: OrderedTable): Promise<number> {
  const [row] = await getDb().select({ max: sql<number>`coalesce(max(${table.sortOrder}), -1)` }).from(table);
  return Number(row.max) + 1;
}

async function reorder(table: OrderedTable, ids: string[]) {
  await getDb().transaction(async (tx) => {
    for (const [sortOrder, id] of ids.entries()) {
      await tx.update(table).set({ sortOrder }).where(eq(table.id, id));
    }
  });
}

/* ------------------------------ Experiences ------------------------------ */

export const createExperience = adminAction(experienceInputSchema, async (input) => {
  const [row] = await getDb()
    .insert(experiences)
    .values({ ...input, sortOrder: await nextSortOrder(experiences) })
    .returning({ id: experiences.id });
  revalidateSite();
  return row;
});

export const updateExperience = adminAction(updateExperienceSchema, async ({ id, ...input }) => {
  const updated = await getDb().update(experiences).set(input).where(eq(experiences.id, id)).returning({ id: experiences.id });
  if (updated.length === 0) throw new NotFoundError("Entry");
  revalidateSite();
});

export const deleteExperience = adminAction(resumeIdSchema, async ({ id }) => {
  await getDb().delete(experiences).where(eq(experiences.id, id));
  revalidateSite();
});

export const reorderExperiences = adminAction(reorderSchema, async ({ ids }) => {
  await reorder(experiences, ids);
  revalidateSite();
});

/* --------------------------------- Skills -------------------------------- */

export const createSkill = adminAction(skillInputSchema, async (input) => {
  const [row] = await getDb()
    .insert(skills)
    .values({ ...input, sortOrder: await nextSortOrder(skills) })
    .returning({ id: skills.id });
  revalidateSite();
  return row;
});

export const updateSkill = adminAction(updateSkillSchema, async ({ id, ...input }) => {
  const updated = await getDb().update(skills).set(input).where(eq(skills.id, id)).returning({ id: skills.id });
  if (updated.length === 0) throw new NotFoundError("Skill");
  revalidateSite();
});

export const deleteSkill = adminAction(resumeIdSchema, async ({ id }) => {
  await getDb().delete(skills).where(eq(skills.id, id));
  revalidateSite();
});
