import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/auth/session";
import { countUnreadMessages } from "@/features/messages/queries";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
  // Chrome's own opt-out from translation; see src/lib/no-translate.ts.
  other: { google: "notranslate" },
};

/**
 * The session is verified on the server before anything renders, so signed-out
 * visitors are redirected without ever receiving dashboard HTML.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUserOrRedirect();
  const badges = { unreadMessages: await countUnreadMessages() };

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <Sidebar badges={badges} />
      <div className="flex min-w-0 flex-col">
        <Topbar user={user} badges={badges} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
