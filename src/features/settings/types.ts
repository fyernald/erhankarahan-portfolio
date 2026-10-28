import type { SocialLinks } from "@/lib/db/schema";
import type { MediaItem } from "@/features/media/types";

export type SiteSettings = {
  ownerName: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  contactTitle: string;
  contactIntro: string;
  email: string;
  phone: string;
  location: string;
  socials: SocialLinks;
  seoTitle: string;
  seoDescription: string;
  heroImage: MediaItem | null;
  aboutImage: MediaItem | null;
  contactImage: MediaItem | null;
  cvDocument: MediaItem | null;
  updatedAt: string;
};
