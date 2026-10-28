import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { publishStatusEnum } from "./enums";
import { media } from "./media";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull().default("Photography"),
    summary: text("summary").notNull().default(""),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    contentHtml: text("content_html").notNull().default(""),
    coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    client: text("client").notNull().default(""),
    year: integer("year"),
    status: publishStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("projects_status_sort_idx").on(table.status, table.sortOrder)],
);

/** Ordered gallery of media items attached to a project. */
export const projectMedia = pgTable(
  "project_media",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.mediaId] })],
);
