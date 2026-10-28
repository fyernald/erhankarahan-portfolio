import "server-only";
import { and, count, desc, eq, ilike, inArray, or, sql, sum, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { media, posts, projectMedia, projects, siteSettings } from "@/lib/db/schema";
import type { MediaKind } from "@/lib/uploads/types";
import { paginate, type Paginated } from "@/lib/utils/pagination";
import { toMediaItem } from "./mappers";
import type { MediaItem } from "./types";

export async function listMedia(options: {
  kind?: MediaKind;
  kinds?: readonly MediaKind[];
  search?: string;
  page: number;
  pageSize: number;
}): Promise<Paginated<MediaItem>> {
  const conditions: SQL[] = [];
  if (options.kind) conditions.push(eq(media.kind, options.kind));
  if (options.kinds?.length) conditions.push(inArray(media.kind, [...options.kinds]));
  if (options.search) {
    const term = `%${options.search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
    conditions.push(or(ilike(media.originalName, term), ilike(media.alt, term))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const db = getDb();

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(media)
      .where(where)
      .orderBy(desc(media.createdAt))
      .limit(options.pageSize)
      .offset((options.page - 1) * options.pageSize),
    db.select({ total: count() }).from(media).where(where),
  ]);
  return paginate(rows.map(toMediaItem), total, options.page, options.pageSize);
}

export async function getMediaByIds(ids: string[]): Promise<MediaItem[]> {
  if (ids.length === 0) return [];
  const rows = await getDb().select().from(media).where(inArray(media.id, ids));
  return rows.map(toMediaItem);
}

export async function getMediaById(id: string | null | undefined): Promise<MediaItem | null> {
  if (!id) return null;
  const row = await getDb().query.media.findFirst({ where: eq(media.id, id) });
  return row ? toMediaItem(row) : null;
}

export type StorageUsage = { kind: MediaKind; files: number; bytes: number }[];

export async function getStorageUsage(): Promise<StorageUsage> {
  const rows = await getDb()
    .select({ kind: media.kind, files: count(), bytes: sum(media.sizeBytes) })
    .from(media)
    .groupBy(media.kind);
  return rows.map((row) => ({ kind: row.kind, files: row.files, bytes: Number(row.bytes ?? 0) }));
}

/** Counts where a media item is referenced so deleting it can be confirmed knowingly. */
export async function countMediaReferences(id: string): Promise<number> {
  const db = getDb();
  const row = await db.query.media.findFirst({ where: eq(media.id, id), columns: { storageKey: true } });
  if (!row) return 0;
  const inContent = `%${row.storageKey}%`;

  const [[postRefs], [projectRefs], [galleryRefs], [settingsRefs]] = await Promise.all([
    db
      .select({ value: count() })
      .from(posts)
      .where(or(eq(posts.coverMediaId, id), ilike(posts.contentHtml, inContent))),
    db
      .select({ value: count() })
      .from(projects)
      .where(or(eq(projects.coverMediaId, id), ilike(projects.contentHtml, inContent))),
    db.select({ value: count() }).from(projectMedia).where(eq(projectMedia.mediaId, id)),
    db
      .select({ value: count() })
      .from(siteSettings)
      .where(
        sql`${id} in (${siteSettings.heroImageId}, ${siteSettings.aboutImageId}, ${siteSettings.contactImageId}, ${siteSettings.cvDocumentId})`,
      ),
  ]);
  return postRefs.value + projectRefs.value + galleryRefs.value + settingsRefs.value;
}
