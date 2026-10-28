import { Download } from "lucide-react";
import { listExperiences, listSkills } from "@/features/resume/queries";
import { ResumeTimeline } from "@/features/resume/components/resume-timeline";
import { getSiteSettings } from "@/features/settings/queries";
import { AboutSection } from "@/features/site/components/about-section";
import { buildSiteMetadata } from "@/features/site/metadata";
import { SiteButtonLink, siteButtonClassName } from "@/components/site/site-button";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return buildSiteMetadata({ title: settings.aboutTitle, alternates: { canonical: "/about" } });
}

export default async function AboutPage() {
  const [settings, experiences, skills] = await Promise.all([getSiteSettings(), listExperiences(), listSkills()]);

  return (
    <>
      <AboutSection
        settings={settings}
        headingLevel="h1"
        actions={
          <>
            {settings.cvDocument && (
              <a href={settings.cvDocument.url} download className={siteButtonClassName}>
                <Download className="size-3.5" /> Download CV
              </a>
            )}
            <SiteButtonLink
              href="/portfolio"
              className={cn(settings.cvDocument && "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white")}
            >
              View my works
            </SiteButtonLink>
          </>
        }
      />
      <ResumeTimeline experiences={experiences} skills={skills} />
    </>
  );
}
