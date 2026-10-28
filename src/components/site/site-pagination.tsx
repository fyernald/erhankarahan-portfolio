import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SitePaginationProps = { page: number; pageCount: number; hrefFor: (page: number) => string };

export function SitePagination({ page, pageCount, hrefFor }: SitePaginationProps) {
  if (pageCount <= 1) return null;
  const linkClass = "inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-ink uppercase";
  return (
    <nav className="mt-20 flex items-center justify-between border-t border-line pt-8" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          <ArrowLeft className="size-4" /> Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="text-xs text-muted">
        {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={cn(linkClass)}>
          Older <ArrowRight className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
