import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatDate } from "@/lib/utils/format";
import { PostForm } from "@/features/posts/components/post-form";
import { getPostForEdit } from "@/features/posts/queries";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/dashboard/posts/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const post = await getPostForEdit(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        title="Edit post"
        description={`Last edited ${formatDate(post.updatedAt, "MMM d, yyyy 'at' HH:mm")}`}
        back={{ href: "/dashboard/posts", label: "All posts" }}
      />
      {/* Keyed so navigating between posts resets the editor state. */}
      <PostForm key={post.id} post={post} />
    </>
  );
}
