import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-line bg-surface shadow-card", className)} {...props} />;
}

type CardHeaderProps = { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string };

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        {description && <p className="text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
