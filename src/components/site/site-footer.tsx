import Link from "next/link";
import type { SiteSettings } from "@/features/settings/types";
import { SITE_NAV } from "./nav-items";
import { SocialLinksList } from "./social-icon";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page flex flex-col gap-10 py-14 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-2xl text-ink">{settings.ownerName}</p>
          <p className="mt-3 text-sm leading-relaxed text-body">{settings.heroTitle}{settings.location ? ` · ${settings.location}` : ""}</p>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline">
              {settings.email}
            </a>
          )}
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-16 gap-y-3 sm:flex sm:gap-10">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-body transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-page flex flex-col-reverse gap-4 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {settings.ownerName}. All rights reserved.</p>
        <SocialLinksList socials={settings.socials} iconClassName="size-3.5" />
      </div>
    </footer>
  );
}
