import { z } from "zod";
import { idSchema, plainText, requiredText } from "@/lib/validation/common";

const isoDate = z.iso.date("Use a valid date");

export const experienceInputSchema = z
  .object({
    kind: z.enum(["work", "education", "award"]),
    title: requiredText(120, "Title"),
    organization: requiredText(120, "Organization"),
    location: plainText(120),
    startDate: isoDate,
    endDate: isoDate.nullable(),
    description: plainText(2000),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"],
  });

export const updateExperienceSchema = z.intersection(experienceInputSchema, z.object({ id: idSchema }));

export const skillInputSchema = z.object({
  name: requiredText(60, "Skill"),
  group: requiredText(40, "Group"),
  level: z.number().int().min(0).max(100),
});
export const updateSkillSchema = skillInputSchema.extend({ id: idSchema });

export const resumeIdSchema = z.object({ id: idSchema });
export const reorderSchema = z.object({ ids: z.array(idSchema).min(1).max(500) });

export type ExperienceInput = z.input<typeof experienceInputSchema>;
export type SkillInput = z.input<typeof skillInputSchema>;
