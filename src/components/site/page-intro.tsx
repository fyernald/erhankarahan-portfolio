import type { ReactNode } from "react";
import { SectionHeading } from "./section-heading";

export function PageIntro({ title, description, children }: { title: string; description?: ReactNode; children?: ReactNode }) {
  return (
    <div className="container-page pt-10 pb-12 lg:pt-16 lg:pb-16">
      <div className="animate-fade-up">
        <SectionHeading title={title} as="h1" description={description} />
      </div>
      {children && <div className="mt-10">{children}</div>}
    </div>
  );
}
