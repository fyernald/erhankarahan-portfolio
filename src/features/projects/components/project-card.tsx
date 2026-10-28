import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/features/media/components/media-image";
import type { ProjectListItem } from "../types";

export function ProjectCard({ project, priority }: { project: ProjectListItem; priority?: boolean }) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block">
      <div className="relative overflow-hidden">
        <MediaImage
          item={project.cover}
          alt={project.cover?.alt || project.title}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="aspect-[4/5] w-full"
          imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-4 right-4 flex size-10 translate-y-2 items-center justify-center rounded-full bg-white text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl font-bold text-ink">{project.title}</h3>
        {project.year && <span className="shrink-0 text-xs text-muted">{project.year}</span>}
      </div>
      <p className="mt-1 text-xs tracking-[0.12em] text-muted uppercase">{project.category}</p>
    </Link>
  );
}
