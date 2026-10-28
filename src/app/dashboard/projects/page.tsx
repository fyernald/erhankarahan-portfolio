import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsList } from "@/features/projects/components/projects-list";
import { listProjectsForAdmin } from "@/features/projects/queries";

export const metadata = { title: "Portfolio" };

export default async function ProjectsPage() {
  const projects = await listProjectsForAdmin();
  return (
    <>
      <PageHeader
        title="Portfolio"
        description="Your works, in the order they appear on the website."
        actions={
          <Link href="/dashboard/projects/new" className={buttonClassName("primary")}>
            <Plus className="size-4" /> New project
          </Link>
        }
      />
      {/* Keyed by order so a server refresh re-seeds the client-side list. */}
      <ProjectsList key={projects.map((project) => project.id + project.updatedAt).join()} projects={projects} />
    </>
  );
}
