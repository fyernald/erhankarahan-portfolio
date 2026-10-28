import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { getMediaByIds } from "@/features/media/queries";
import type { SiteSettings } from "./types";

const SETTINGS_ID = 1;

/** Loads the singleton settings row (creating it with defaults on first run). Memoised per request. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const db = getDb();
  let row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, SETTINGS_ID) });
  if (!row) {
    [row] = await db.insert(siteSettings).values({ id: SETTINGS_ID }).onConflictDoNothing().returning();
    row ??= await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, SETTINGS_ID) });
    if (!row) throw new Error("Failed to initialise site settings");
  }

  const mediaIds = [row.heroImageId, row.aboutImageId, row.contactImageId, row.cvDocumentId].filter(
    (id): id is string => Boolean(id),
  );
  const mediaById = new Map((await getMediaByIds(mediaIds)).map((item) => [item.id, item]));
  const pick = (id: string | null) => (id ? (mediaById.get(id) ?? null) : null);

  return {
    ownerName: row.ownerName,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    aboutTitle: row.aboutTitle,
    aboutBody: row.aboutBody,
    contactTitle: row.contactTitle,
    contactIntro: row.contactIntro,
    email: row.email,
    phone: row.phone,
    location: row.location,
    socials: row.socials,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    heroImage: pick(row.heroImageId),
    aboutImage: pick(row.aboutImageId),
    contactImage: pick(row.contactImageId),
    cvDocument: pick(row.cvDocumentId),
    updatedAt: row.updatedAt.toISOString(),
  };
});
