import { check, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestamps } from "./columns";
import { media } from "./media";

export type SocialLinks = Partial<
  Record<"facebook" | "twitter" | "pinterest" | "instagram" | "youtube" | "linkedin" | "vimeo", string>
>;

/** Single-row table holding the editable copy of the public website. */
export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    ownerName: text("owner_name").notNull().default("Erhan Karahan"),
    heroTitle: text("hero_title").notNull().default("Photographer & Film Maker"),
    heroSubtitle: text("hero_subtitle").notNull().default("Based in Istanbul"),
    heroImageId: uuid("hero_image_id").references(() => media.id, { onDelete: "set null" }),
    aboutTitle: text("about_title").notNull().default("About Me"),
    aboutBody: text("about_body").notNull().default(""),
    aboutImageId: uuid("about_image_id").references(() => media.id, { onDelete: "set null" }),
    contactTitle: text("contact_title").notNull().default("Contact Me"),
    contactIntro: text("contact_intro").notNull().default("I would love to get suggestions from you."),
    contactImageId: uuid("contact_image_id").references(() => media.id, { onDelete: "set null" }),
    cvDocumentId: uuid("cv_document_id").references(() => media.id, { onDelete: "set null" }),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    location: text("location").notNull().default(""),
    socials: jsonb("socials").$type<SocialLinks>().notNull().default({}),
    seoTitle: text("seo_title").notNull().default("Erhan Karahan — Photographer & Film Maker"),
    seoDescription: text("seo_description").notNull().default(""),
    ...timestamps,
  },
  (table) => [check("site_settings_singleton", sql`${table.id} = 1`)],
);
