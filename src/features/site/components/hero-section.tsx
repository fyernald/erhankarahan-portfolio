import { MediaImage } from "@/features/media/components/media-image";
import type { SiteSettings } from "@/features/settings/types";
import { SiteButtonLink } from "@/components/site/site-button";

/** Headline on the left half and photo on the right half, side by side so a long title never covers the photo. */
export function HeroSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="container-page pt-6 pb-20 lg:pt-4 lg:pb-32">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-0">
        <div className="animate-fade-up lg:col-start-1 lg:col-end-7 lg:row-start-1 lg:pr-10">
          <h1 className="font-display text-[40px] leading-[1.15] text-ink sm:text-5xl lg:text-[52px] xl:text-[56px]">
            <span className="block font-bold">{settings.heroTitle}</span>
            {settings.heroSubtitle && <span className="mt-2 block font-normal">{settings.heroSubtitle}</span>}
          </h1>
          <SiteButtonLink href="/contact" className="mt-10 lg:mt-14">
            Hire me
          </SiteButtonLink>
        </div>
        <div className="animate-fade-in lg:col-start-7 lg:col-end-13 lg:row-start-1" style={{ animationDelay: "150ms" }}>
          <MediaImage
            item={settings.heroImage}
            alt={settings.heroImage?.alt || `Portrait of ${settings.ownerName}`}
            sizes="(min-width: 1024px) 560px, 100vw"
            priority
            className="aspect-[1.08] w-full"
          />
        </div>
      </div>
    </section>
  );
}
