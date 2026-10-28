import { Camera } from "lucide-react";
import { ProjectCard } from "@/features/projects/components/project-card";
import { listPublishedCategories, listPublishedProjects } from "@/features/projects/queries";
import { buildSiteMetadata } from "@/features/site/metadata";
import { FilterChips } from "@/components/site/filter-chips";
import { PageIntro } from "@/components/site/page-intro";

export const generateMetadata = () => buildSiteMetadata({ title: "Portfolio", alternates: { canonical: "/portfolio" } });

export default async function PortfolioPage({ searchParams }: PageProps<"/portfolio">) {
  const params = await searchParams;
  const categories = await listPublishedCategories();
  const category = typeof params.category === "string" && categories.includes(params.category) ? params.category : undefined;
  const projects = await listPublishedProjects({ category });

  return (
    <>
      <PageIntro title="Portfolio" description="A selection of photography and film work — portraits, travel, commercial and documentary stories.">
        <FilterChips
          label="Filter by category"
          items={[
            { label: "All", href: "/portfolio", active: !category },
            ...categories.map((name) => ({ label: name, href: `/portfolio?category=${encodeURIComponent(name)}`, active: name === category })),
          ]}
        />
      </PageIntro>
      <section className="container-page pb-24 lg:pb-32" aria-label="Projects">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 bg-mist px-6 py-24 text-center">
            <Camera className="size-8 text-ink" strokeWidth={1.25} />
            <p className="font-display text-2xl font-bold text-ink">New work is on its way</p>
            <p className="text-sm text-body">Projects will appear here as soon as they are published.</p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}>
                <ProjectCard project={project} priority={index < 3} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
