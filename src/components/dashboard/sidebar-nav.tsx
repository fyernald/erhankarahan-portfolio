"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { DASHBOARD_NAV, isNavItemActive } from "./nav-items";

export type NavBadges = { unreadMessages: number };

export function SidebarNav({ badges, onNavigate }: { badges: NavBadges; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-7" aria-label="Dashboard">
      {DASHBOARD_NAV.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">{group.title}</p>
          {group.items.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors",
                  active ? "bg-ink text-white shadow-sm" : "text-body hover:bg-canvas hover:text-ink",
                )}
              >
                <item.icon className={cn("size-[18px]", active ? "text-white" : "text-muted group-hover:text-ink")} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 font-bold",
                      active ? "bg-white text-ink" : "bg-accent text-white",
                    )}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
