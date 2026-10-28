import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/card";

/** Settings group: explanatory column on the left, fields on the right. */
export function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
      <Card>
        <CardBody className="flex flex-col gap-4">{children}</CardBody>
      </Card>
    </section>
  );
}
