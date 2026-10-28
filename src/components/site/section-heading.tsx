import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  title: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
  description?: ReactNode;
};

/** Playfair heading with the short rule underneath, as in the design. */
export function SectionHeading({ title, as: Tag = "h2", align = "left", className, description }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "flex flex-col items-center text-center", className)}>
      <Tag className="font-display text-[34px] leading-tight font-bold text-ink sm:text-[42px]">{title}</Tag>
      <span className="mt-5 block h-px w-10 bg-ink/60" aria-hidden />
      {description && <p className="mt-6 max-w-xl text-sm leading-loose text-body">{description}</p>}
    </div>
  );
}
