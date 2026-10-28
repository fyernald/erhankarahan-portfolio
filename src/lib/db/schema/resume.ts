import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { experienceKindEnum } from "./enums";

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: experienceKindEnum("kind").notNull().default("work"),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  location: text("location").notNull().default(""),
  startDate: date("start_date", { mode: "string" }).notNull(),
  /** `null` means "present". */
  endDate: date("end_date", { mode: "string" }),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  group: text("group").notNull().default("General"),
  /** 0-100 proficiency shown as a bar on the public CV. */
  level: integer("level").notNull().default(80),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});
