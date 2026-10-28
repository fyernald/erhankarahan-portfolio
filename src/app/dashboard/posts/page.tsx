import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchField } from "@/components/dashboard/search-field";
import { PostsList } from "@/features/posts/components/posts-list";
import { listPostsForAdmin } from "@/features/posts/queries";
import type { PostStatus } from "@/features/posts/types";

export const metadata = { title: "Blog posts" };

function parseStatus(value: unknown): PostStatus | undefined {
  return value === "draft" || value === "published" ? value : undefined;
}

export default async function PostsPage({ searchParams }: PageProps<"/dashboard/posts">) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const search = typeof params.q === "string" ? params.q.slice(0, 100) : undefined;
  const posts = await listPostsForAdmin({ status, search });

  return (
    <>
      <PageHeader
        title="Blog posts"
        description="Write, publish and organise your journal."
        actions={
          <Link href="/dashboard/posts/new" className={buttonClassName("primary")}>
            <Plus className="size-4" /> New post
          </Link>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          param="status"
          tabs={[
            { value: undefined, label: "All" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Drafts" },
          ]}
        />
        <SearchField placeholder="Search posts" />
      </div>
      <PostsList posts={posts} filtered={Boolean(status || search)} />
    </>
  );
}
