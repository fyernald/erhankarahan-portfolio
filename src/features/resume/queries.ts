import "server-only";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { experiences, skills } from "@/lib/db/schema";
import type { Experience, Skill } from "./types";

export async function listExperiences(): Promise<Experience[]> {
  const rows = await getDb()
    .select()
    .from(experiences)
    .orderBy(asc(experiences.sortOrder), desc(experiences.startDate));
  return rows.map(({ createdAt, updatedAt, ...rest }) => {
    void createdAt;
    void updatedAt;
    return rest;
  });
}

export async function listSkills(): Promise<Skill[]> {
  const rows = await getDb().select().from(skills).orderBy(asc(skills.sortOrder), asc(skills.name));
  return rows.map(({ id, name, group, level, sortOrder }) => ({ id, name, group, level, sortOrder }));
}
