"use server";

import { eq } from "drizzle-orm";
import { adminAction } from "@/lib/actions/admin-action";
import { NotFoundError } from "@/lib/actions/errors";
import { revalidateSite } from "@/lib/cache/revalidate";
import { getDb } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { getStorage } from "@/lib/storage/object-storage";
import { countMediaReferences, listMedia } from "./queries";
import { listMediaSchema, mediaIdSchema, updateMediaAltSchema } from "./schemas";

export const updateMediaAlt = adminAction(updateMediaAltSchema, async ({ id, alt }) => {
  const updated = await getDb().update(media).set({ alt }).where(eq(media.id, id)).returning({ id: media.id });
  if (updated.length === 0) throw new NotFoundError("File");
  revalidateSite();
});

export const getMediaUsage = adminAction(mediaIdSchema, async ({ id }) => ({ references: await countMediaReferences(id) }));

export const deleteMedia = adminAction(mediaIdSchema, async ({ id }) => {
  const db = getDb();
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!row) throw new NotFoundError("File");

  // Remove the database row first so the file disappears from the UI even if
  // object deletion has to be retried; orphaned objects are harmless and private.
  await db.delete(media).where(eq(media.id, id));
  await getStorage()
    .deleteMany([row.storageKey, ...(row.posterKey ? [row.posterKey] : [])])
    .catch((error) => console.error("[media] failed to delete objects", error));
  revalidateSite();
});

/** Used by the media picker dialog (client side) to browse the library. */
export const browseMedia = adminAction(listMediaSchema, async ({ kinds, search, page }) =>
  listMedia({ kinds, search, page, pageSize: 24 }),
);
