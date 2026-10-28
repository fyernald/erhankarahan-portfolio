import { z } from "zod";
import {
  idSchema,
  optionalMediaId,
  plainText,
  publishStatusSchema,
  requiredText,
  richTextSchema,
  slugSchema,
} from "@/lib/validation/common";

export const postInputSchema = z.object({
  title: requiredText(160, "Title"),
  slug: slugSchema,
  excerpt: plainText(320),
  content: richTextSchema,
  coverMediaId: optionalMediaId,
  tags: z.array(z.string().trim().toLowerCase().min(1).max(32)).max(12),
  status: publishStatusSchema,
});

export const updatePostSchema = postInputSchema.extend({ id: idSchema });
export const postIdSchema = z.object({ id: idSchema });
export const postStatusSchema = z.object({ id: idSchema, status: publishStatusSchema });

export type PostInput = z.input<typeof postInputSchema>;
