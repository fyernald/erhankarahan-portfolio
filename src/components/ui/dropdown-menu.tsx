"use client";

import type { ReactNode } from "react";
import { DropdownMenu as Menu } from "radix-ui";
import { cn } from "@/lib/utils/cn";

export type MenuAction = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
};

type DropdownMenuProps = { trigger: ReactNode; actions: MenuAction[]; align?: "start" | "end" };

export function DropdownMenu({ trigger, actions, align = "end" }: DropdownMenuProps) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-44 rounded-xl border border-line bg-surface p-1 shadow-popover data-[state=open]:animate-fade-in"
        >
          {actions.map((action) => (
            <Menu.Item
              key={action.label}
              disabled={action.disabled}
              onSelect={action.onSelect}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium outline-none",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                action.tone === "danger"
                  ? "text-danger data-[highlighted]:bg-danger-soft"
                  : "text-ink data-[highlighted]:bg-canvas",
              )}
            >
              {action.icon}
              {action.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
