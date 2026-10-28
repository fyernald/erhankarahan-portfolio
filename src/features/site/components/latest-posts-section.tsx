import Link from "next/link";
import { PostCard } from "@/features/posts/components/post-card";
import type { PostListItem } from "@/features/posts/types";
import { SectionHeading } from "@/components/site/section-heading";

export function LatestPostsSection({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="container-page section-spacing border-t border-line" aria-label="From the journal">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="From the Journal" />
        <Link href="/blog" className="text-xs font-semibold tracking-[0.12em] text-ink uppercase underline-offset-8 hover:underline">
          Read the blog
        </Link>
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
