import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type ContentEditorLayoutProps = {
  document: ReactNode;
  sidebar: ReactNode;
  /** Extra sections rendered under the document (e.g. a gallery). */
  below?: ReactNode;
};

/** Two-column editing layout: document on the left, settings sidebar on the right. */
export function ContentEditorLayout({ document, sidebar, below }: ContentEditorLayoutProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6 self-start">
        <Card>{document}</Card>
        {below}
      </div>
      <aside className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">{sidebar}</aside>
    </div>
  );
}
