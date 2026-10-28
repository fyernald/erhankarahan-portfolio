"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type FilterTab = { value: string | undefined; label: string; count?: number };

/** URL-driven segmented control: each tab is a link that sets one query parameter. */
export function FilterTabs({ param, tabs }: { param: string; tabs: FilterTab[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? undefined;

  function hrefFor(value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(param, value);
    else next.delete(param);
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="inline-flex rounded-control border border-line bg-surface p-1" role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === current;
        return (
          <Link
            key={tab.label}
            href={hrefFor(tab.value)}
            role="tab"
            aria-selected={active}
            scroll={false}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors",
              active ? "bg-ink text-white" : "text-body hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && <span className={cn("text-xs", active ? "text-white/70" : "text-muted")}>{tab.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
