"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import { createSkill, updateSkill } from "../actions";
import type { Skill } from "../types";

type SkillDialogProps = { skill?: Skill; groups: string[]; onClose: () => void; onSaved: () => void };

export function SkillDialog({ skill, groups, onClose, onSaved }: SkillDialogProps) {
  const [level, setLevel] = useState(skill?.level ?? 80);
  const create = useServerAction(createSkill, { successMessage: "Skill added", onSuccess: onSaved });
  const update = useServerAction(updateSkill, { successMessage: "Skill updated", onSuccess: onSaved });
  const { pending, fieldErrors } = skill ? update : create;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = { name: String(form.get("name") ?? ""), group: String(form.get("group") ?? ""), level };
    if (skill) void update.run({ id: skill.id, ...input });
    else void create.run(input);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={skill ? "Edit skill" : "Add skill"} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Skill" error={fieldErrors.name}>
          <Input name="name" defaultValue={skill?.name} placeholder="e.g. Color grading" required autoFocus />
        </Field>
        <Field label="Group" error={fieldErrors.group} hint="Skills are grouped on your resume.">
          <Input name="group" defaultValue={skill?.group ?? groups[0] ?? "Tools"} list="skill-groups" required />
        </Field>
        <datalist id="skill-groups">
          {groups.map((group) => (
            <option key={group} value={group} />
          ))}
        </datalist>
        <Field label={`Proficiency · ${level}%`}>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={level}
            onChange={(event) => setLevel(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-ink"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {skill ? "Save" : "Add skill"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
