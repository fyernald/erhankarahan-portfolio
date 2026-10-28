import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "../types";

type MediaImageProps = {
  item: MediaItem | null;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** `cover` crops to the box, `contain` keeps the whole image (e.g. cut-outs). */
  fit?: "cover" | "contain";
  alt?: string;
};

/**
 * Responsive, optimised image for public pages with a blur-up placeholder. When no
 * image has been chosen yet it renders a calm branded placeholder instead.
 */
export function MediaImage({ item, sizes, className, imageClassName, priority, fit = "cover", alt }: MediaImageProps) {
  const src = item?.kind === "video" ? item.posterUrl : item?.kind === "image" ? item.url : null;
  return (
    <div className={cn("relative overflow-hidden bg-mist", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt ?? item?.alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          quality={75}
          placeholder={item?.blurDataUrl ? "blur" : "empty"}
          blurDataURL={item?.blurDataUrl ?? undefined}
          className={cn(fit === "cover" ? "object-cover" : "object-contain object-bottom", imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <Camera className="size-10 text-mist-strong" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
