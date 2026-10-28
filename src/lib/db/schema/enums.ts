import { pgEnum } from "drizzle-orm/pg-core";

export const mediaKindEnum = pgEnum("media_kind", ["image", "video", "document"]);
export const publishStatusEnum = pgEnum("publish_status", ["draft", "published"]);
export const experienceKindEnum = pgEnum("experience_kind", ["work", "education", "award"]);
