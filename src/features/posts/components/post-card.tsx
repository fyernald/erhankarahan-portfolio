import Link from "next/link";
import { MediaImage } from "@/features/media/components/media-image";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PostListItem } from "../types";

type PostCardProps = { post: PostListItem; variant?: "default" | "featured" };

export function PostMeta({ post }: { post: PostListItem }) {
  return (
    <p className="text-xs tracking-[0.08em] text-muted uppercase">
      <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
      <span className="mx-2">·</span>
      {post.readingMinutes} min read
    </p>
  );
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const featured = variant === "featured";
  return (
    <Link href={`/blog/${post.slug}`} className={cn("group grid gap-6", featured && "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-14")}>
      <MediaImage
        item={post.cover}
        alt={post.cover?.alt || post.title}
        sizes={featured ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"}
        priority={featured}
        className={featured ? "aspect-[16/10] w-full" : "aspect-[3/2] w-full"}
        imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div>
        <PostMeta post={post} />
        <h3 className={cn("mt-3 font-display font-bold text-ink transition-colors group-hover:text-ink-soft", featured ? "text-3xl leading-tight sm:text-4xl" : "text-xl leading-snug")}>
          {post.title}
        </h3>
        <p className={cn("mt-3 line-clamp-3 leading-relaxed text-body", featured ? "text-[15px]" : "text-sm")}>{post.excerpt}</p>
        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="bg-mist px-2.5 py-1 text-[11px] font-semibold text-ink">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
