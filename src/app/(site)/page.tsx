import { listPublishedPosts } from "@/features/posts/queries";
import { listPublishedProjects } from "@/features/projects/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { configuredSocials } from "@/components/site/social-icon";
import { AboutSection } from "@/features/site/components/about-section";
import { ContactSection } from "@/features/site/components/contact-section";
import { FeaturedWorksSection } from "@/features/site/components/featured-works-section";
import { HeroSection } from "@/features/site/components/hero-section";
import { JsonLd } from "@/features/site/components/json-ld";
import { LatestPostsSection } from "@/features/site/components/latest-posts-section";
import { buildSiteMetadata } from "@/features/site/metadata";

export const generateMetadata = () => buildSiteMetadata();

export default async function HomePage() {
  const [settings, featured, posts] = await Promise.all([
    getSiteSettings(),
    listPublishedProjects({ featuredOnly: true, limit: 6 }),
    listPublishedPosts({ page: 1, pageSize: 3 }),
  ]);
  const works = featured.length > 0 ? featured : await listPublishedProjects({ limit: 6 });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: settings.ownerName,
          jobTitle: settings.heroTitle,
          email: settings.email || undefined,
          sameAs: configuredSocials(settings.socials).map((link) => link.href),
        }}
      />
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <FeaturedWorksSection projects={works} />
      <LatestPostsSection posts={posts.items} />
      <ContactSection settings={settings} />
    </>
  );
}
