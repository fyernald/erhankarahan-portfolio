"use server";

import { adminAction } from "@/lib/actions/admin-action";
import { revalidateSite } from "@/lib/cache/revalidate";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { siteSettingsSchema } from "./schemas";

export const updateSiteSettings = adminAction(siteSettingsSchema, async (input) => {
  const socials = Object.fromEntries(Object.entries(input.socials).filter(([, url]) => Boolean(url)));
  const values = { ...input, socials };
  await getDb()
    .insert(siteSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values });
  revalidateSite();
});
