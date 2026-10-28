import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type FilterChipsProps = { items: { label: string; href: string; active: boolean }[]; label: string };

export function FilterChips({ items, label }: FilterChipsProps) {
  if (items.length <= 1) return null;
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center border px-4 text-xs font-semibold tracking-[0.08em] uppercase transition-colors",
                item.active ? "border-ink bg-ink text-white" : "border-line text-body hover:border-ink hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
