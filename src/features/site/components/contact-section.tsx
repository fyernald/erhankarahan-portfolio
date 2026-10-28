import { ContactForm } from "@/features/messages/components/contact-form";
import { MediaImage } from "@/features/media/components/media-image";
import type { SiteSettings } from "@/features/settings/types";
import { SectionHeading } from "@/components/site/section-heading";

/**
 * Light blue band with the form on the left and a cut-out portrait on the right
 * that rises above the band, as in the design.
 */
export function ContactSection({ settings, headingLevel = "h2" }: { settings: SiteSettings; headingLevel?: "h1" | "h2" }) {
  return (
    <section className="pt-16 lg:pt-36" aria-label="Contact">
      <div className="bg-mist">
        <div className="container-page grid lg:grid-cols-2 lg:gap-16">
          <div className="py-16 lg:py-28 lg:pl-[8%]">
            <SectionHeading title={settings.contactTitle} as={headingLevel} />
            {settings.contactIntro && <p className="mt-7 text-[13px] text-body">{settings.contactIntro}</p>}
            <div className="mt-10 max-w-md">
              <ContactForm />
            </div>
          </div>
          {settings.contactImage && (
            <div className="relative hidden lg:block">
              <MediaImage
                item={settings.contactImage}
                alt={settings.contactImage.alt || settings.ownerName}
                sizes="520px"
                fit="contain"
                className="absolute inset-x-0 bottom-0 h-[calc(100%+6rem)] bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
