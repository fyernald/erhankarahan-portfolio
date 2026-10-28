"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { isSiteNavActive, SITE_NAV } from "./nav-items";

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-12">
        {SITE_NAV.map((item) => {
          const active = isSiteNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 text-[13px] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-ink after:transition-transform",
                  active ? "font-semibold text-ink after:scale-x-100" : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
