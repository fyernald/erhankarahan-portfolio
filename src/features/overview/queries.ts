import "server-only";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contactMessages, media, posts, projects } from "@/lib/db/schema";
import { getStorageUsage, type StorageUsage } from "@/features/media/queries";
import { toPostListItem } from "@/features/posts/mappers";
import type { PostListItem } from "@/features/posts/types";
import { listMessages } from "@/features/messages/queries";
import type { ContactMessage } from "@/features/messages/types";

export type MonthlyActivity = { month: string; posts: number; uploads: number };

export type DashboardOverview = {
  counts: { posts: number; publishedPosts: number; projects: number; media: number; unreadMessages: number };
  storage: StorageUsage;
  activity: MonthlyActivity[];
  recentPosts: PostListItem[];
  recentMessages: ContactMessage[];
};

const ACTIVITY_MONTHS = 6;

function lastMonths(total: number): string[] {
  const now = new Date();
  return Array.from({ length: total }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (total - 1 - index), 1));
    return date.toISOString().slice(0, 7);
  });
}

async function monthlyCounts(table: typeof posts | typeof media, since: Date): Promise<Map<string, number>> {
  const month = sql<string>`to_char(date_trunc('month', ${table.createdAt}), 'YYYY-MM')`;
  const rows = await getDb()
    .select({ month, value: count() })
    .from(table)
    .where(gte(table.createdAt, since))
    .groupBy(month);
  return new Map(rows.map((row) => [row.month, row.value]));
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const db = getDb();
  const months = lastMonths(ACTIVITY_MONTHS);
  const since = new Date(`${months[0]}-01T00:00:00Z`);

  const [[postCount], [publishedCount], [projectCount], [mediaCount], [unread], storage, postsByMonth, uploadsByMonth, recentRows, recentMessages] =
    await Promise.all([
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(posts).where(eq(posts.status, "published")),
      db.select({ value: count() }).from(projects),
      db.select({ value: count() }).from(media),
      db.select({ value: count() }).from(contactMessages).where(sql`${contactMessages.readAt} is null`),
      getStorageUsage(),
      monthlyCounts(posts, since),
      monthlyCounts(media, since),
      db.query.posts.findMany({ with: { cover: true }, orderBy: [desc(posts.updatedAt)], limit: 5 }),
      listMessages(4),
    ]);

  return {
    counts: {
      posts: postCount.value,
      publishedPosts: publishedCount.value,
      projects: projectCount.value,
      media: mediaCount.value,
      unreadMessages: unread.value,
    },
    storage,
    activity: months.map((month) => ({
      month,
      posts: postsByMonth.get(month) ?? 0,
      uploads: uploadsByMonth.get(month) ?? 0,
    })),
    recentPosts: recentRows.map(toPostListItem),
    recentMessages,
  };
}
