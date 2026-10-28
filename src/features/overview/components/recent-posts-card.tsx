import Link from "next/link";
import { Newspaper } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelative } from "@/lib/utils/format";
import { MediaThumb } from "@/features/media/components/media-thumb";
import { StatusBadge } from "@/features/posts/components/status-badge";
import type { PostListItem } from "@/features/posts/types";

export function RecentPostsCard({ posts }: { posts: PostListItem[] }) {
  return (
    <Card>
      <CardHeader
        title="Recent posts"
        description="Your latest journal entries"
        action={
          <Link href="/dashboard/posts" className={buttonClassName("ghost", "sm")}>
            View all
          </Link>
        }
      />
      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No posts yet"
          description="Write your first journal entry to share a story behind your work."
          action={
            <Link href="/dashboard/posts/new" className={buttonClassName("primary", "sm")}>
              Write a post
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/dashboard/posts/${post.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-canvas sm:px-6">
                <MediaThumb item={post.cover} className="size-12 shrink-0 rounded-lg" sizes="48px" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{post.title}</p>
                  <p className="mt-0.5 text-xs text-muted">Edited {formatRelative(post.updatedAt)}</p>
                </div>
                <StatusBadge status={post.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
