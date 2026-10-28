import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DashboardBrand } from "./brand";
import { SidebarNav, type NavBadges } from "./sidebar-nav";

export function Sidebar({ badges }: { badges: NavBadges }) {
  return (
    <div className="hidden border-r border-line bg-surface lg:block">
      <aside className="sticky top-0 flex h-dvh flex-col gap-8 px-4 py-6">
        <DashboardBrand />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav badges={badges} />
        </div>
        <ViewSiteCard />
      </aside>
    </div>
  );
}

export function ViewSiteCard() {
  return (
    <div className="rounded-card bg-mist p-4">
      <p className="text-sm font-bold text-ink">Your public website</p>
      <p className="mt-1 text-xs leading-relaxed text-body">See how visitors experience your latest changes.</p>
      <Link
        href="/"
        target="_blank"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-ink underline-offset-4 hover:underline"
      >
        Open erhankarahan.com <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}
