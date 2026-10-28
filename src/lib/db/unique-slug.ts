import "server-only";
import { and, eq, like, ne, or, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { slugify } from "@/lib/utils/slugify";
import { getDb } from "./index";

type SluggedTable = PgTable & { id: PgColumn; slug: PgColumn };

/**
 * Returns `base` or `base-2`, `base-3`… so slugs stay unique per table.
 * `excludeId` lets a record keep its own slug while being edited.
 */
export async function uniqueSlug(table: SluggedTable, input: string, excludeId?: string): Promise<string> {
  const base = slugify(input) || "untitled";
  const conditions: SQL[] = [or(eq(table.slug, base), like(table.slug, `${base}-%`))!];
  if (excludeId) conditions.push(ne(table.id, excludeId));

  const rows = await getDb()
    .select({ slug: table.slug })
    .from(table)
    .where(and(...conditions));
  const taken = new Set(rows.map((row) => row.slug as string));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
