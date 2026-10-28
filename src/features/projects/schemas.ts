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

const currentYear = new Date().getFullYear();

export const projectInputSchema = z.object({
  title: requiredText(160, "Title"),
  slug: slugSchema,
  category: requiredText(48, "Category"),
  summary: plainText(400),
  content: richTextSchema,
  coverMediaId: optionalMediaId,
  galleryMediaIds: z.array(z.uuid()).max(120),
  client: plainText(120),
  year: z.number().int().min(1950).max(currentYear + 1).nullable(),
  status: publishStatusSchema,
  featured: z.boolean(),
});

export const updateProjectSchema = projectInputSchema.extend({ id: idSchema });
export const projectIdSchema = z.object({ id: idSchema });
export const reorderProjectsSchema = z.object({ ids: z.array(idSchema).min(1).max(500) });

export type ProjectInput = z.input<typeof projectInputSchema>;
