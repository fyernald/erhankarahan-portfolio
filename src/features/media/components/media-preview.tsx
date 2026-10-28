import Image from "next/image";
import { FileText } from "lucide-react";
import type { MediaItem } from "../types";

/** Full preview used in the details dialog: image, playable video or document card. */
export function MediaPreview({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    return (
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-canvas">
        <Image
          src={item.url}
          alt={item.alt || item.originalName}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-contain"
          placeholder={item.blurDataUrl ? "blur" : "empty"}
          blurDataURL={item.blurDataUrl ?? undefined}
        />
      </div>
    );
  }
  if (item.kind === "video") {
    return (
      <video
        src={item.url}
        poster={item.posterUrl ?? undefined}
        controls
        preload="metadata"
        playsInline
        className="aspect-video w-full rounded-xl bg-ink"
      />
    );
  }
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl bg-mist text-ink">
      <FileText className="size-10" />
      <span className="max-w-[80%] truncate text-sm font-bold">{item.originalName}</span>
    </div>
  );
}
