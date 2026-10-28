import "server-only";
import type { Metadata } from "next";
import { getSiteSettings } from "@/features/settings/queries";

/** Default metadata derived from the editable SEO settings. */
export async function buildSiteMetadata(overrides: Metadata = {}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = settings.heroImage?.url;
  return {
    title: { absolute: settings.seoTitle },
    description: settings.seoDescription || undefined,
    openGraph: {
      type: "website",
      siteName: settings.ownerName,
      title: settings.seoTitle,
      description: settings.seoDescription || undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary" },
    alternates: { canonical: "/" },
    ...overrides,
  };
}
