import Image from "next/image";
import type { MediaItem } from "@/features/media/types";

/** Masonry-style gallery of photos and clips; stored dimensions keep natural aspect ratios. */
export function ProjectGallery({ items, title }: { items: MediaItem[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <div className="columns-1 gap-6 sm:columns-2 [&>*]:mb-6">
      {items.map((item) =>
        item.kind === "video" ? (
          <video
            key={item.id}
            src={item.url}
            poster={item.posterUrl ?? undefined}
            controls
            preload="metadata"
            playsInline
            className="w-full break-inside-avoid bg-ink"
          />
        ) : (
          <Image
            key={item.id}
            src={item.url}
            alt={item.alt || title}
            width={item.width ?? 1600}
            height={item.height ?? 1200}
            sizes="(min-width: 640px) 50vw, 100vw"
            placeholder={item.blurDataUrl ? "blur" : "empty"}
            blurDataURL={item.blurDataUrl ?? undefined}
            className="h-auto w-full break-inside-avoid bg-mist"
          />
        ),
      )}
    </div>
  );
}
