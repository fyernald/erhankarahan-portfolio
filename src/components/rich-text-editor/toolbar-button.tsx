"use client";

import type { ReactNode } from "react";
import { Tooltip } from "radix-ui";
import { cn } from "@/lib/utils/cn";

type ToolbarButtonProps = {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function ToolbarButton({ label, shortcut, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <Tooltip.Root delayDuration={400}>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-body transition-colors",
            "hover:bg-canvas hover:text-ink disabled:pointer-events-none disabled:opacity-35",
            active && "bg-ink text-white hover:bg-ink hover:text-white",
          )}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content sideOffset={6} className="z-50 rounded-md bg-ink px-2 py-1 text-xs font-semibold text-white shadow-popover animate-fade-in">
          {label}
          {shortcut && <span className="ml-1.5 text-white/60">{shortcut}</span>}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />;
}
