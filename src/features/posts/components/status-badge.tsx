import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "../types";

export function StatusBadge({ status }: { status: PostStatus }) {
  return status === "published" ? (
    <Badge tone="success">
      <span className="size-1.5 rounded-full bg-success" aria-hidden /> Published
    </Badge>
  ) : (
    <Badge tone="warning">
      <span className="size-1.5 rounded-full bg-warning" aria-hidden /> Draft
    </Badge>
  );
}
