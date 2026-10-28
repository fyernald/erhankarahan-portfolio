"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isSiteNavActive, SITE_NAV } from "./nav-items";

export function MobileMenu({ ownerName, footer }: { ownerName: string; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger className="-mr-2 p-2 text-ink lg:hidden" aria-label="Open menu">
        <Menu className="size-6" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-surface px-4 py-5 data-[state=open]:animate-fade-in sm:px-6">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Site navigation</DialogPrimitive.Description>
          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-ink">{ownerName}</span>
            <DialogPrimitive.Close className="-mr-2 p-2 text-ink" aria-label="Close menu">
              <X className="size-6" />
            </DialogPrimitive.Close>
          </div>
          <nav className="mt-16 flex flex-1 flex-col gap-2" aria-label="Main">
            {SITE_NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "animate-fade-up py-2 font-display text-4xl",
                  isSiteNavActive(pathname, item.href) ? "font-bold text-ink" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {footer}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
