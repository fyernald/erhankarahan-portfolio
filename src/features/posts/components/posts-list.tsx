"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, ExternalLink, MoreHorizontal, Newspaper, Pencil, Trash2 } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { useServerAction } from "@/hooks/use-server-action";
import { TimeAgo } from "@/components/ui/time-ago";
import { MediaThumb } from "@/features/media/components/media-thumb";
import { deletePost, setPostStatus } from "../actions";
import type { PostListItem } from "../types";
import { StatusBadge } from "./status-badge";

export function PostsList({ posts, filtered }: { posts: PostListItem[]; filtered: boolean }) {
  const router = useRouter();
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PostListItem | null>(null);
  const remove = useServerAction(deletePost, { successMessage: "Post deleted" });
  const toggleStatus = useServerAction(setPostStatus, { onSuccess: () => router.refresh() });

  const visible = posts.filter((post) => !removedIds.has(post.id));

  if (visible.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Newspaper}
          title={filtered ? "No posts match your filters" : "Your journal is empty"}
          description={filtered ? "Try a different search or status." : "Share behind-the-scenes stories, travel notes and tips."}
          action={
            !filtered && (
              <Link href="/dashboard/posts/new" className={buttonClassName("primary")}>
                Write your first post
              </Link>
            )
          }
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1fr)_120px_140px_48px] gap-4 border-b border-line bg-canvas/60 px-6 py-3 text-xs font-bold tracking-wide text-muted uppercase md:grid">
        <span>Post</span>
        <span>Status</span>
        <span>Updated</span>
        <span className="sr-only">Actions</span>
      </div>
      <ul>
        <AnimatePresence initial={false}>
          {visible.map((post) => (
            <motion.li
              key={post.id}
              layout
              exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
              className="border-b border-line last:border-b-0"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-canvas/60 sm:px-6 md:grid-cols-[minmax(0,1fr)_120px_140px_48px]">
                <Link href={`/dashboard/posts/${post.id}`} className="flex min-w-0 items-center gap-4">
                  <MediaThumb item={post.cover} className="aspect-[4/3] w-16 shrink-0 rounded-lg" sizes="64px" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{post.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {post.tags.length ? post.tags.map((tag) => `#${tag}`).join(" ") : `${post.readingMinutes} min read`}
                    </p>
                    <div className="mt-1.5 md:hidden">
                      <StatusBadge status={post.status} />
                    </div>
                  </div>
                </Link>
                <span className="hidden md:block">
                  <StatusBadge status={post.status} />
                </span>
                <TimeAgo date={post.updatedAt} className="hidden text-sm text-body md:block" />
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${post.title}`}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                  actions={[
                    { label: "Edit", icon: <Pencil className="size-4" />, onSelect: () => router.push(`/dashboard/posts/${post.id}`) },
                    ...(post.status === "published"
                      ? [
                          { label: "View on site", icon: <ExternalLink className="size-4" />, onSelect: () => window.open(`/blog/${post.slug}`, "_blank") },
                          { label: "Unpublish", icon: <EyeOff className="size-4" />, onSelect: () => toggleStatus.run({ id: post.id, status: "draft" as const }) },
                        ]
                      : [{ label: "Publish", icon: <Eye className="size-4" />, onSelect: () => toggleStatus.run({ id: post.id, status: "published" as const }) }]),
                    { label: "Delete", icon: <Trash2 className="size-4" />, tone: "danger" as const, onSelect: () => setPendingDelete(post) },
                  ]}
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this post?"
        description={`"${pendingDelete?.title}" will be permanently removed. This cannot be undone.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const result = await remove.run({ id: pendingDelete.id });
          if (!result.ok) return false;
          setRemovedIds((current) => new Set(current).add(pendingDelete.id));
          router.refresh();
        }}
      />
    </Card>
  );
}
