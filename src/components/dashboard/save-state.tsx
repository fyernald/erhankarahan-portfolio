import { Check, CircleDot } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

/** Small status line next to save buttons: saving / unsaved / saved. */
export function SaveState({ saving, dirty }: { saving: boolean; dirty: boolean }) {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Spinner className="size-3.5" /> Saving…
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
        <CircleDot className="size-3.5" /> Unsaved changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success animate-fade-in">
      <Check className="size-3.5" /> All changes saved
    </span>
  );
}
