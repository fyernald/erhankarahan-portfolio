"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { adminAction } from "@/lib/actions/admin-action";
import { failure, success, type ActionResult } from "@/lib/actions/result";
import { revalidateSite } from "@/lib/cache/revalidate";
import { getDb } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { getClientIp, hashIp } from "@/lib/security/client-ip";
import { getRateLimiter } from "@/lib/security/rate-limit";
import { contactMessageSchema, markMessageSchema, messageIdSchema, type ContactMessageInput } from "./schemas";

const contactLimiter = () => getRateLimiter("contact-form", 5, 60 * 60_000);

/** Public action used by the contact form. Rate limited per IP and protected by a honeypot. */
export async function submitContactMessage(input: ContactMessageInput): Promise<ActionResult> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return failure("Please check the form.", z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
  }

  const ipHash = hashIp(getClientIp(await headers()));
  if (!contactLimiter().consume(ipHash).allowed) {
    return failure("You have sent several messages already. Please try again later.");
  }

  // Bots that fill the honeypot get a fake success so they don't adapt.
  if (parsed.data.website) return success(undefined);

  const { name, email, message } = parsed.data;
  try {
    await getDb().insert(contactMessages).values({ name, email: email.toLowerCase(), message, ipHash });
  } catch (error) {
    console.error("[contact] failed to store message", error);
    return failure("Your message could not be sent. Please try again.");
  }
  revalidateSite();
  return success(undefined, "Thanks! Your message has been sent.");
}

export const markMessageRead = adminAction(markMessageSchema, async ({ id, read }) => {
  await getDb()
    .update(contactMessages)
    .set({ readAt: read ? new Date() : null })
    .where(eq(contactMessages.id, id));
  revalidateSite();
});

export const deleteMessage = adminAction(messageIdSchema, async ({ id }) => {
  await getDb().delete(contactMessages).where(eq(contactMessages.id, id));
  revalidateSite();
});
