"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ExternalLink, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/lib/auth/client";
import type { SessionUser } from "@/lib/auth/session";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu({ user }: { user: Pick<SessionUser, "name" | "email"> }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      setSigningOut(false);
      toast.error("Could not sign out. Please try again.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className="flex items-center gap-3 rounded-control py-1 pr-2 pl-1 transition-colors hover:bg-canvas"
          aria-label="Account menu"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-mist-strong text-xs font-bold text-ink">
            {signingOut ? <Spinner /> : initials(user.name)}
          </span>
          <span className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-sm font-bold text-ink">{user.name}</span>
            <span className="text-xs text-muted">{user.email}</span>
          </span>
          <ChevronDown className="hidden size-4 text-muted sm:block" />
        </button>
      }
      actions={[
        { label: "Settings", icon: <Settings className="size-4" />, onSelect: () => router.push("/dashboard/settings") },
        { label: "View website", icon: <ExternalLink className="size-4" />, onSelect: () => window.open("/", "_blank") },
        { label: "Sign out", icon: <LogOut className="size-4" />, onSelect: handleSignOut, tone: "danger" },
      ]}
    />
  );
}
