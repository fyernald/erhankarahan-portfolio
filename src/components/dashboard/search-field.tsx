"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

/** Debounced search box that syncs its value to the `q` query parameter. */
export function SearchField({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (value.trim() === current) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
    }, 300);
    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-72">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
        {pending ? <Spinner className="size-4" /> : <Search className="size-4" />}
      </span>
      <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="pl-9" aria-label="Search" />
    </div>
  );
}
