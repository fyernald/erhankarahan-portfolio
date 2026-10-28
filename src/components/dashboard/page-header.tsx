import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
};

export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        {back && (
          <Link href={back.href} className="mb-1 inline-flex w-fit items-center gap-1 text-xs font-bold text-muted transition-colors hover:text-ink">
            <ChevronLeft className="size-3.5" /> {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
