import { z } from "zod";
import { idSchema } from "@/lib/validation/common";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.email("Please enter a valid email").max(160),
  message: z.string().trim().min(10, "Message is too short").max(4000, "Message is too long"),
  /** Honeypot: real users never see or fill this field. */
  website: z.string().max(0).optional().default(""),
});

export const messageIdSchema = z.object({ id: idSchema });
export const markMessageSchema = z.object({ id: idSchema, read: z.boolean() });

export type ContactMessageInput = z.input<typeof contactMessageSchema>;
