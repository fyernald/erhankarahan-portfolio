import Link from "next/link";
import { ProjectCard } from "@/features/projects/components/project-card";
import type { ProjectListItem } from "@/features/projects/types";
import { SectionHeading } from "@/components/site/section-heading";

export function FeaturedWorksSection({ projects }: { projects: ProjectListItem[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="container-page section-spacing" aria-label="Selected works">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="Selected Works" />
        <Link href="/portfolio" className="text-xs font-semibold tracking-[0.12em] text-ink uppercase underline-offset-8 hover:underline">
          View all works
        </Link>
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
