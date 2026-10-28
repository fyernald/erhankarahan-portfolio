import type { MediaItem } from "@/features/media/types";
import type { PostStatus } from "@/features/posts/types";

export type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  client: string;
  year: number | null;
  status: PostStatus;
  featured: boolean;
  sortOrder: number;
  updatedAt: string;
  cover: MediaItem | null;
};

export type ProjectDetail = ProjectListItem & {
  content: Record<string, unknown>;
  contentHtml: string;
  gallery: MediaItem[];
};
