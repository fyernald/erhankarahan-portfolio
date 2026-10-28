import { PageHeader } from "@/components/dashboard/page-header";
import { PostForm } from "@/features/posts/components/post-form";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <>
      <PageHeader title="New post" back={{ href: "/dashboard/posts", label: "All posts" }} />
      <PostForm />
    </>
  );
}
