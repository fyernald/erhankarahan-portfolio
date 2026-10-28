import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { MediaImage } from "@/features/media/components/media-image";
import type { SiteSettings } from "@/features/settings/types";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteButtonLink } from "@/components/site/site-button";
import { toParagraphs } from "@/lib/utils/text";

type AboutSectionProps = { settings: SiteSettings; headingLevel?: "h1" | "h2"; actions?: ReactNode };

/** Full-bleed photo on the left edge with the biography on the right. */
export function AboutSection({ settings, headingLevel = "h2", actions }: AboutSectionProps) {
  const paragraphs = toParagraphs(settings.aboutBody);
  return (
    <section className="section-spacing" aria-labelledby="about-heading">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[7%]">
        <div className="relative px-4 sm:px-6 lg:px-0">
          <MediaImage
            item={settings.aboutImage}
            alt={settings.aboutImage?.alt || settings.ownerName}
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="aspect-[4/5] w-full lg:aspect-[0.8]"
          />
          <ArrowDown className="absolute -bottom-14 left-8 hidden size-8 text-ink lg:block" strokeWidth={1} aria-hidden />
        </div>
        <div className="max-w-[560px] px-4 sm:px-6 lg:px-0 lg:pr-8">
          <SectionHeading title={<span id="about-heading">{settings.aboutTitle}</span>} as={headingLevel} />
          <div className="mt-8 flex flex-col gap-5 text-[13px] leading-[2.15] text-body sm:text-sm">
            {paragraphs.length > 0 ? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>Biography coming soon.</p>}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">{actions ?? <SiteButtonLink href="/portfolio">View my works</SiteButtonLink>}</div>
        </div>
      </div>
    </section>
  );
}
