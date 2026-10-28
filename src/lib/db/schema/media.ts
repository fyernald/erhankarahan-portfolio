import { bigint, index, integer, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps } from "./columns";
import { mediaKindEnum } from "./enums";

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: mediaKindEnum("kind").notNull(),
    /** Object key inside the bucket. Always server generated, never derived from user input. */
    storageKey: text("storage_key").notNull().unique(),
    /** Poster frame for videos (JPEG/WebP object key). */
    posterKey: text("poster_key"),
    mimeType: text("mime_type").notNull(),
    extension: text("extension").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: real("duration_seconds"),
    /** Tiny base64 preview used as an image placeholder. */
    blurDataUrl: text("blur_data_url"),
    sha256: text("sha256").notNull(),
    originalName: text("original_name").notNull(),
    alt: text("alt").notNull().default(""),
    uploadedById: text("uploaded_by_id").references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [index("media_kind_idx").on(table.kind), index("media_created_at_idx").on(table.createdAt)],
);
