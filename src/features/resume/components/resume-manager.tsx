"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { GraduationCap, MapPin, Pencil, Plus, Sparkles, Trash2, Trophy, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useServerAction } from "@/hooks/use-server-action";
import { formatDateRange } from "@/lib/utils/format";
import { deleteExperience, deleteSkill } from "../actions";
import { EXPERIENCE_KIND_LABELS, type Experience, type ExperienceKind, type Skill } from "../types";
import { ExperienceDialog } from "./experience-dialog";
import { SkillDialog } from "./skill-dialog";

const KIND_ICONS = { work: BriefcaseBusiness, education: GraduationCap, award: Trophy } as const;

type Editing =
  | { type: "experience"; experience?: Experience; kind?: ExperienceKind }
  | { type: "skill"; skill?: Skill }
  | null;
type Deleting = { type: "experience"; item: Experience } | { type: "skill"; item: Skill } | null;

export function ResumeManager({ experiences, skills }: { experiences: Experience[]; skills: Skill[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Deleting>(null);
  const removeExperience = useServerAction(deleteExperience, { successMessage: "Entry deleted" });
  const removeSkill = useServerAction(deleteSkill, { successMessage: "Skill deleted" });

  const groups = Array.from(new Set(skills.map((skill) => skill.group)));
  const closeAndRefresh = () => {
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        {(Object.keys(EXPERIENCE_KIND_LABELS) as ExperienceKind[]).map((kind) => {
          const entries = experiences.filter((entry) => entry.kind === kind);
          const Icon = KIND_ICONS[kind];
          return (
            <Card key={kind}>
              <CardHeader
                title={EXPERIENCE_KIND_LABELS[kind]}
                description={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
                action={
                  <Button variant="secondary" size="sm" onClick={() => setEditing({ type: "experience", kind })}>
                    <Plus className="size-3.5" /> Add
                  </Button>
                }
              />
              {entries.length === 0 ? (
                <EmptyState icon={Icon} title={`No ${EXPERIENCE_KIND_LABELS[kind].toLowerCase()} yet`} className="py-10" />
              ) : (
                <ol className="relative px-5 py-2 sm:px-6">
                  <AnimatePresence initial={false}>
                    {entries.map((entry) => (
                      <motion.li
                        key={entry.id}
                        layout
                        exit={{ opacity: 0, height: 0 }}
                        className="group relative flex gap-4 border-b border-line py-4 last:border-b-0"
                      >
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-mist text-ink">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink">{entry.title}</p>
                          <p className="text-[13px] text-body">
                            {entry.organization}
                            {entry.location && (
                              <span className="ml-2 inline-flex items-center gap-1 text-muted">
                                <MapPin className="size-3" /> {entry.location}
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-muted">{formatDateRange(entry.startDate, entry.endDate)}</p>
                          {entry.description && <p className="mt-2 line-clamp-2 text-[13px] text-body">{entry.description}</p>}
                        </div>
                        <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${entry.title}`} onClick={() => setEditing({ type: "experience", experience: entry })}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="hover:text-danger" aria-label={`Delete ${entry.title}`} onClick={() => setDeleting({ type: "experience", item: entry })}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="self-start">
        <CardHeader
          title="Skills"
          description="Shown as progress bars on your resume"
          action={
            <Button variant="secondary" size="sm" onClick={() => setEditing({ type: "skill" })}>
              <Plus className="size-3.5" /> Add
            </Button>
          }
        />
        {skills.length === 0 ? (
          <EmptyState icon={Sparkles} title="No skills yet" className="py-10" />
        ) : (
          <CardBody className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-3 text-xs font-bold tracking-wide text-muted uppercase">{group}</p>
                <ul className="flex flex-col gap-3">
                  {skills
                    .filter((skill) => skill.group === group)
                    .map((skill) => (
                      <li key={skill.id} className="group">
                        <div className="flex items-center justify-between gap-2">
                          <button type="button" className="text-left text-sm font-semibold text-ink hover:underline" onClick={() => setEditing({ type: "skill", skill })}>
                            {skill.name}
                          </button>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted tabular-nums">{skill.level}%</span>
                            <Button variant="ghost" size="icon-sm" className="size-7 hover:text-danger" aria-label={`Delete ${skill.name}`} onClick={() => setDeleting({ type: "skill", item: skill })}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-mist">
                          <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${skill.level}%` }} />
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </CardBody>
        )}
      </Card>

      {editing?.type === "experience" && (
        <ExperienceDialog experience={editing.experience} defaultKind={editing.kind} onClose={() => setEditing(null)} onSaved={closeAndRefresh} />
      )}
      {editing?.type === "skill" && <SkillDialog skill={editing.skill} groups={groups} onClose={() => setEditing(null)} onSaved={closeAndRefresh} />}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting?.type === "skill" ? "Delete this skill?" : "Delete this entry?"}
        description={`"${deleting?.type === "skill" ? deleting.item.name : deleting?.item.title}" will be removed from your resume.`}
        onConfirm={async () => {
          if (!deleting) return;
          const result =
            deleting.type === "skill" ? await removeSkill.run({ id: deleting.item.id }) : await removeExperience.run({ id: deleting.item.id });
          if (!result.ok) return false;
          router.refresh();
        }}
      />
    </div>
  );
}
