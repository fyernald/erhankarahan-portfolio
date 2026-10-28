import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export const siteButtonClassName = cn(
  "inline-flex h-12 items-center justify-center gap-2 bg-ink px-7 text-xs font-semibold tracking-[0.12em] text-white uppercase",
  "transition-[background-color,transform] duration-200 hover:bg-ink-soft active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
);

/** The square, uppercase call-to-action used across the public site. */
export function SiteButtonLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(siteButtonClassName, className)} {...props} />;
}
