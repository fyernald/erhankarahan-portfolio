"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, Reorder, motion, useDragControls } from "motion/react";
import { BriefcaseBusiness, GripVertical, Star } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useServerAction } from "@/hooks/use-server-action";
import { MediaThumb } from "@/features/media/components/media-thumb";
import { StatusBadge } from "@/features/posts/components/status-badge";
import { reorderProjects } from "../actions";
import type { ProjectListItem } from "../types";

/** Drag-and-drop ordered list; the order here is the order on the public portfolio. */
export function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(projects);
  const [savedOrder, setSavedOrder] = useState(() => projects.map((project) => project.id).join());
  const reorder = useServerAction(reorderProjects, {
    successMessage: "Order saved",
    onSuccess: () => router.refresh(),
  });

  function persistOrder() {
    const order = items.map((item) => item.id);
    if (order.join() === savedOrder) return;
    setSavedOrder(order.join());
    void reorder.run({ ids: order });
  }

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={BriefcaseBusiness}
          title="No projects yet"
          description="Add your best shoots and films to build your portfolio."
          action={
            <Link href="/dashboard/projects/new" className={buttonClassName("primary")}>
              Add a project
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-canvas/60 px-6 py-3 text-xs font-bold tracking-wide text-muted uppercase">
        <span>Drag to reorder</span>
        <AnimatePresence>
          {reorder.pending && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 normal-case">
              <Spinner className="size-3.5" /> Saving order…
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Reorder.Group axis="y" values={items} onReorder={setItems} as="ul">
        {items.map((project) => (
          <ProjectRow key={project.id} project={project} onDragEnd={persistOrder} />
        ))}
      </Reorder.Group>
    </Card>
  );
}

function ProjectRow({ project, onDragEnd }: { project: ProjectListItem; onDragEnd: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="relative border-b border-line bg-surface last:border-b-0"
      whileDrag={{ scale: 1.01, boxShadow: "0 12px 32px -8px rgb(14 17 19 / 0.18)", zIndex: 10 }}
    >
      <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
        <button
          type="button"
          onPointerDown={(event) => controls.start(event)}
          className="cursor-grab touch-none rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink active:cursor-grabbing"
          aria-label={`Drag to reorder ${project.title}`}
        >
          <GripVertical className="size-4" />
        </button>
        <Link href={`/dashboard/projects/${project.id}`} className="flex min-w-0 flex-1 items-center gap-4">
          <MediaThumb item={project.cover} className="aspect-[4/5] w-12 shrink-0 rounded-lg" sizes="48px" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
              {project.title}
              {project.featured && <Star className="size-3.5 shrink-0 fill-warning text-warning" aria-label="Featured" />}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">
              {[project.category, project.client, project.year].filter(Boolean).join(" · ")}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </Link>
      </div>
    </Reorder.Item>
  );
}
