import { z } from "zod";
import { optionalMediaId, plainText, requiredText } from "@/lib/validation/common";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^https:\/\/[^\s]+$/i.test(value), "Use a full https:// link")
  .optional()
  .transform((value) => value || undefined);

export const SOCIAL_NETWORKS = ["facebook", "twitter", "pinterest", "instagram", "youtube", "linkedin", "vimeo"] as const;

export const siteSettingsSchema = z.object({
  ownerName: requiredText(80, "Name"),
  heroTitle: requiredText(120, "Headline"),
  heroSubtitle: plainText(120),
  heroImageId: optionalMediaId,
  aboutTitle: requiredText(80, "Title"),
  aboutBody: plainText(5000),
  aboutImageId: optionalMediaId,
  contactTitle: requiredText(80, "Title"),
  contactIntro: plainText(300),
  contactImageId: optionalMediaId,
  cvDocumentId: optionalMediaId,
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  phone: plainText(40),
  location: plainText(120),
  socials: z.object(Object.fromEntries(SOCIAL_NETWORKS.map((network) => [network, optionalUrl])) as Record<
    (typeof SOCIAL_NETWORKS)[number],
    typeof optionalUrl
  >),
  seoTitle: requiredText(120, "SEO title"),
  seoDescription: plainText(300),
});

export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
