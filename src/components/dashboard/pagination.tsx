"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/** Previous/next pagination that preserves the other query parameters. */
export function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(target));
    return `${pathname}?${next.toString()}`;
  };

  return (
    <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        className={cn(buttonClassName("secondary", "sm"), page <= 1 && "pointer-events-none opacity-40")}
      >
        <ChevronLeft className="size-4" /> Previous
      </Link>
      <span className="text-sm text-muted">
        Page <span className="font-bold text-ink">{page}</span> of {pageCount}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= pageCount}
        className={cn(buttonClassName("secondary", "sm"), page >= pageCount && "pointer-events-none opacity-40")}
      >
        Next <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
