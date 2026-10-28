import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MediaImage } from "@/features/media/components/media-image";
import { ProjectGallery } from "@/features/projects/components/project-gallery";
import { getAdjacentProjects, getPublishedProjectBySlug } from "@/features/projects/queries";
import { buildSiteMetadata } from "@/features/site/metadata";
import { RichTextContent } from "@/components/site/rich-text-content";
import { SLUG_PATTERN } from "@/lib/utils/slugify";

async function loadProject(slug: string) {
  return SLUG_PATTERN.test(slug) ? getPublishedProjectBySlug(slug) : null;
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return { title: "Not found" };
  const image = project.cover?.url;
  return buildSiteMetadata({
    title: project.title,
    description: project.summary || undefined,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: { type: "article", title: project.title, description: project.summary || undefined, images: image ? [{ url: image }] : undefined },
  });
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();
  const { previous, next } = await getAdjacentProjects(project.slug);
  const meta = [
    { label: "Category", value: project.category },
    { label: "Client", value: project.client },
    { label: "Year", value: project.year ? String(project.year) : "" },
  ].filter((entry) => entry.value);

  return (
    <article>
      <header className="container-page pt-10 pb-12 lg:pt-16">
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-muted uppercase transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" /> All works
        </Link>
        <div className="mt-8 grid animate-fade-up gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <h1 className="font-display text-4xl leading-tight font-bold text-ink sm:text-5xl lg:text-6xl">{project.title}</h1>
            {project.summary && <p className="mt-6 max-w-xl text-[15px] leading-loose text-body">{project.summary}</p>}
          </div>
          <dl className="grid grid-cols-3 gap-6 border-t border-line pt-6">
            {meta.map((entry) => (
              <div key={entry.label}>
                <dt className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">{entry.label}</dt>
                <dd className="mt-2 text-sm font-semibold text-ink">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {project.cover && (
        <MediaImage item={project.cover} alt={project.cover.alt || project.title} sizes="100vw" priority className="aspect-[16/9] w-full lg:aspect-[21/9]" />
      )}

      <div className="container-page py-16 lg:py-24">
        {project.contentHtml && <RichTextContent html={project.contentHtml} className="mx-auto max-w-[720px]" />}
        {project.gallery.length > 0 && (
          <div className={project.contentHtml ? "mt-16 lg:mt-24" : undefined}>
            <ProjectGallery items={project.gallery} title={project.title} />
          </div>
        )}
      </div>

      {(previous || next) && (
        <nav className="border-t border-line" aria-label="More projects">
          <div className="container-page grid grid-cols-2 py-10">
            {previous ? (
              <Link href={`/portfolio/${previous.slug}`} className="group flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" /> Previous
                </span>
                <span className="font-display text-lg font-bold text-ink sm:text-2xl">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/portfolio/${next.slug}`} className="group flex flex-col items-end gap-2 text-right">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
                  Next <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="font-display text-lg font-bold text-ink sm:text-2xl">{next.title}</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
