"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { SaveState } from "@/components/dashboard/save-state";
import { StatusBadge } from "@/features/posts/components/status-badge";
import type { PostStatus } from "@/features/posts/types";

type PublishCardProps = {
  status: PostStatus;
  /** Status currently stored in the database (undefined for a new record). */
  savedStatus?: PostStatus;
  saving: boolean;
  dirty: boolean;
  onSave: (status: PostStatus) => void;
  publicHref?: string;
  deletion?: { title: string; description: string; onConfirm: () => Promise<boolean | void> };
  children?: ReactNode;
};

/** Save / publish controls shared by every publishable content type. */
export function PublishCard({ status, savedStatus, saving, dirty, onSave, publicHref, deletion, children }: PublishCardProps) {
  return (
    <Card>
      <CardHeader title="Publish" action={<StatusBadge status={status} />} />
      <CardBody className="flex flex-col gap-4">
        <SaveState saving={saving} dirty={dirty} />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => onSave("draft")} loading={saving && status === "draft"} disabled={saving}>
            {savedStatus === "published" ? "Unpublish" : "Save draft"}
          </Button>
          <Button onClick={() => onSave("published")} loading={saving && status === "published"} disabled={saving}>
            {savedStatus === "published" ? "Update" : "Publish"}
          </Button>
        </div>
        {children}
        <p className="text-xs text-muted">Tip: press Ctrl/⌘ + S to save at any time.</p>
        {deletion && (
          <div className="flex items-center justify-between border-t border-line pt-4">
            {savedStatus === "published" && publicHref ? (
              <a href={publicHref} target="_blank" rel="noreferrer" className={buttonClassName("ghost", "sm")}>
                <ExternalLink className="size-3.5" /> View live
              </a>
            ) : (
              <span className="text-xs text-muted">Not visible on the website</span>
            )}
            <DeleteButton size="sm" {...deletion} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
