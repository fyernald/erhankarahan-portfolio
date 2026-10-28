import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/utils/slugify";

export const idSchema = z.uuid();

export const optionalMediaId = z.uuid().nullable().optional().transform((value) => value ?? null);

export const slugSchema = z
  .string()
  .trim()
  .max(96)
  .refine((value) => value === "" || SLUG_PATTERN.test(value), "Use lowercase letters, numbers and dashes only");

export const publishStatusSchema = z.enum(["draft", "published"]);

/**
 * Structural check for Tiptap JSON. Full validation happens when the document is
 * rendered through the editor schema on the server.
 */
export type RichTextNode = { type: string; [key: string]: unknown };
export const richTextSchema = z
  .looseObject({ type: z.literal("doc"), content: z.array(z.looseObject({ type: z.string() })).optional() })
  .refine((doc) => JSON.stringify(doc).length <= 1_500_000, "The document is too large");

export const plainText = (max: number) => z.string().trim().max(max);
export const requiredText = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
