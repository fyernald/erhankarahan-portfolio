import { z } from "zod";
import { idSchema } from "@/lib/validation/common";

export const mediaKindFilterSchema = z.enum(["image", "video", "document"]).optional().catch(undefined);
export const updateMediaAltSchema = z.object({ id: idSchema, alt: z.string().trim().max(240) });
export const mediaIdSchema = z.object({ id: idSchema });

export const listMediaSchema = z.object({
  kinds: z.array(z.enum(["image", "video", "document"])).min(1).max(3),
  search: z.string().trim().max(100).optional(),
  page: z.number().int().min(1).max(10_000).default(1),
});
