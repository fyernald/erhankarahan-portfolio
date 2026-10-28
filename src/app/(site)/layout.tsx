import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteSettings } from "@/features/settings/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <SiteHeader settings={settings} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
