import type { SiteSettings } from "@/features/settings/types";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SiteNav } from "./site-nav";
import { SocialLinksList } from "./social-icon";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="relative z-30 bg-surface">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:h-[88px] lg:px-8">
        <Logo name={settings.ownerName} />
        <div className="flex items-center gap-16">
          <SiteNav />
          <SocialLinksList socials={settings.socials} className="hidden xl:flex" />
          <MobileMenu ownerName={settings.ownerName} footer={<SocialLinksList socials={settings.socials} iconClassName="size-5" className="gap-6" />} />
        </div>
      </div>
    </header>
  );
}
