import type { SessionUser } from "@/lib/auth/session";
import { MobileNav } from "./mobile-nav";
import type { NavBadges } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

export function Topbar({ user, badges }: { user: SessionUser; badges: NavBadges }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6 lg:px-10">
      <div className="flex items-center gap-2">
        <MobileNav badges={badges} />
        <p className="hidden text-sm text-muted sm:block">
          Welcome back, <span className="font-bold text-ink">{user.name.split(" ")[0]}</span>
        </p>
      </div>
      <UserMenu user={user} />
    </header>
  );
}
