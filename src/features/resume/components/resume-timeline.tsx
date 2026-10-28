import { formatDateRange } from "@/lib/utils/format";
import { SectionHeading } from "@/components/site/section-heading";
import { EXPERIENCE_KIND_LABELS, type Experience, type ExperienceKind, type Skill } from "../types";

/** Public CV: timeline columns for experience/education/awards plus skill bars. */
export function ResumeTimeline({ experiences, skills }: { experiences: Experience[]; skills: Skill[] }) {
  const kinds = (Object.keys(EXPERIENCE_KIND_LABELS) as ExperienceKind[]).filter((kind) => experiences.some((entry) => entry.kind === kind));
  const groups = Array.from(new Set(skills.map((skill) => skill.group)));
  if (kinds.length === 0 && skills.length === 0) return null;

  return (
    <section className="container-page section-spacing border-t border-line" aria-label="Resume">
      <SectionHeading title="Resume" />
      <div className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-24">
        <div className="flex flex-col gap-14">
          {kinds.map((kind) => (
            <div key={kind}>
              <h3 className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{EXPERIENCE_KIND_LABELS[kind]}</h3>
              <ol className="mt-6 border-l border-line">
                {experiences
                  .filter((entry) => entry.kind === kind)
                  .map((entry) => (
                    <li key={entry.id} className="relative pb-10 pl-8 last:pb-0">
                      <span className="absolute top-1.5 -left-[5px] size-[9px] rounded-full border border-ink bg-surface" aria-hidden />
                      <p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{formatDateRange(entry.startDate, entry.endDate)}</p>
                      <h4 className="mt-2 font-display text-xl font-bold text-ink">{entry.title}</h4>
                      <p className="mt-1 text-sm text-body">
                        {entry.organization}
                        {entry.location && <span className="text-muted"> · {entry.location}</span>}
                      </p>
                      {entry.description && <p className="mt-3 max-w-xl text-sm leading-loose text-body">{entry.description}</p>}
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
        {skills.length > 0 && (
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <div key={group}>
                <h3 className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{group}</h3>
                <ul className="mt-6 flex flex-col gap-5">
                  {skills
                    .filter((skill) => skill.group === group)
                    .map((skill) => (
                      <li key={skill.id}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-ink">{skill.name}</span>
                          <span className="text-muted tabular-nums">{skill.level}%</span>
                        </div>
                        <div className="mt-2 h-px bg-line">
                          <div className="h-px bg-ink" style={{ width: `${skill.level}%` }} />
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
