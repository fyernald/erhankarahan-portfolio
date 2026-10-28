import Image from "next/image";
import { FileText, ImageIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "../types";

type MediaThumbProps = {
  item: MediaItem | null;
  className?: string;
  sizes?: string;
  /** Show a play badge over video posters. */
  showKindBadge?: boolean;
};

/** Square-ish preview for any media kind (image, video poster or document icon). */
export function MediaThumb({ item, className, sizes = "160px", showKindBadge = true }: MediaThumbProps) {
  const src = item?.kind === "image" ? item.url : item?.kind === "video" ? item.posterUrl : null;

  return (
    <div className={cn("relative overflow-hidden bg-mist", className)}>
      {src ? (
        <Image
          src={src}
          alt={item?.alt || item?.originalName || ""}
          fill
          sizes={sizes}
          className="object-cover"
          placeholder={item?.blurDataUrl ? "blur" : "empty"}
          blurDataURL={item?.blurDataUrl ?? undefined}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          {item?.kind === "document" ? <FileText className="size-6" /> : <ImageIcon className="size-6" />}
        </div>
      )}
      {showKindBadge && item?.kind === "video" && (
        <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur">
          <Play className="size-3 fill-current" />
        </span>
      )}
    </div>
  );
}
