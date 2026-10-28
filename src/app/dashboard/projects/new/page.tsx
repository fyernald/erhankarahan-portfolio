import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/features/projects/components/project-form";
import { listProjectCategories } from "@/features/projects/queries";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const categories = await listProjectCategories();
  return (
    <>
      <PageHeader title="New project" back={{ href: "/dashboard/projects", label: "Portfolio" }} />
      <ProjectForm categories={categories} />
    </>
  );
}
