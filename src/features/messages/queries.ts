import "server-only";
import { count, desc, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import type { ContactMessage } from "./types";

export async function listMessages(limit = 200): Promise<ContactMessage[]> {
  const rows = await getDb().select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function countUnreadMessages(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(contactMessages).where(isNull(contactMessages.readAt));
  return row.value;
}
