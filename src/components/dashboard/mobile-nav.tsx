"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overlayClassName } from "@/components/ui/dialog";
import { DashboardBrand } from "./brand";
import { SidebarNav, type NavBadges } from "./sidebar-nav";

/** Slide-in navigation drawer for tablets and phones. */
export function MobileNav({ badges }: { badges: NavBadges }) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClassName} />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-8 bg-surface px-4 py-6 shadow-popover transition-transform data-[state=open]:animate-fade-in">
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Dashboard sections</DialogPrimitive.Description>
          <div className="flex items-center justify-between">
            <DashboardBrand />
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close navigation">
                <X className="size-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav badges={badges} onNavigate={() => setOpen(false)} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
