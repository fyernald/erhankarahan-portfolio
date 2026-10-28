import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/features/settings/queries";
import { ContactSection } from "@/features/site/components/contact-section";
import { buildSiteMetadata } from "@/features/site/metadata";
import { SocialLinksList } from "@/components/site/social-icon";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return buildSiteMetadata({ title: settings.contactTitle, alternates: { canonical: "/contact" } });
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const details = [
    settings.email && { icon: Mail, label: settings.email, href: `mailto:${settings.email}` },
    settings.phone && { icon: Phone, label: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    settings.location && { icon: MapPin, label: settings.location },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href?: string }[];

  return (
    <>
      <ContactSection settings={settings} headingLevel="h1" />
      <section className="container-page py-16" aria-label="Contact details">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-col gap-4 sm:flex-row sm:gap-12">
            {details.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-ink">
                <Icon className="size-4 text-muted" strokeWidth={1.5} />
                {href ? (
                  <a href={href} className="underline-offset-4 hover:underline">
                    {label}
                  </a>
                ) : (
                  label
                )}
              </li>
            ))}
          </ul>
          <SocialLinksList socials={settings.socials} iconClassName="size-4" className="gap-6" />
        </div>
      </section>
    </>
  );
}
