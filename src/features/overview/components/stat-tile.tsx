import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatTileProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  href: string;
};

export function StatTile({ label, value, detail, icon: Icon, href }: StatTileProps) {
  return (
    <Card className="group relative p-5 transition-shadow hover:shadow-popover">
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-mist text-ink">
          <Icon className="size-[18px]" />
        </span>
        <ArrowUpRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
      </div>
      <p className="mt-5 text-[13px] font-semibold text-muted">{label}</p>
      <p className="mt-1 text-[28px] leading-none font-extrabold tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
      <Link href={href} className="absolute inset-0 rounded-card" aria-label={`Open ${label.toLowerCase()}`} />
    </Card>
  );
}
