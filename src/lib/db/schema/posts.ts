import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";
import { timestamps } from "./columns";
import { publishStatusEnum } from "./enums";
import { media } from "./media";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull().default(""),
    /** Tiptap JSON document – the source of truth for the editor. */
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    /** Server-rendered and sanitised HTML used on the public site. */
    contentHtml: text("content_html").notNull().default(""),
    coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    status: publishStatusEnum("status").notNull().default("draft"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    index("posts_status_published_idx").on(table.status, table.publishedAt),
    index("posts_tags_idx").using("gin", table.tags),
  ],
);
