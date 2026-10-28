import type { MediaItem } from "@/features/media/types";

export type PostStatus = "draft" | "published";

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: PostStatus;
  tags: string[];
  readingMinutes: number;
  publishedAt: string | null;
  updatedAt: string;
  cover: MediaItem | null;
};

export type PostDetail = PostListItem & {
  content: Record<string, unknown>;
  contentHtml: string;
};
