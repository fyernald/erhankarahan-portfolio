import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatDate } from "@/lib/utils/format";
import { ProjectForm } from "@/features/projects/components/project-form";
import { getProjectForEdit, listProjectCategories } from "@/features/projects/queries";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/dashboard/projects/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [project, categories] = await Promise.all([getProjectForEdit(id), listProjectCategories()]);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title="Edit project"
        description={`Last edited ${formatDate(project.updatedAt, "MMM d, yyyy 'at' HH:mm")}`}
        back={{ href: "/dashboard/projects", label: "Portfolio" }}
      />
      <ProjectForm key={project.id} project={project} categories={categories} />
    </>
  );
}
