"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useServerAction } from "@/hooks/use-server-action";
import { createExperience, updateExperience } from "../actions";
import { EXPERIENCE_KIND_LABELS, type Experience, type ExperienceKind } from "../types";

const KIND_OPTIONS = (Object.keys(EXPERIENCE_KIND_LABELS) as ExperienceKind[]).map((value) => ({
  value,
  label: EXPERIENCE_KIND_LABELS[value],
}));

type ExperienceDialogProps = {
  experience?: Experience;
  defaultKind?: ExperienceKind;
  onClose: () => void;
  onSaved: () => void;
};

export function ExperienceDialog({ experience, defaultKind = "work", onClose, onSaved }: ExperienceDialogProps) {
  const [kind, setKind] = useState<ExperienceKind>(experience?.kind ?? defaultKind);
  const [current, setCurrent] = useState(experience ? experience.endDate === null : false);

  const create = useServerAction(createExperience, { successMessage: "Entry added", onSuccess: onSaved });
  const update = useServerAction(updateExperience, { successMessage: "Entry updated", onSuccess: onSaved });
  const { pending, fieldErrors } = experience ? update : create;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      kind,
      title: String(form.get("title") ?? ""),
      organization: String(form.get("organization") ?? ""),
      location: String(form.get("location") ?? ""),
      startDate: String(form.get("startDate") ?? ""),
      endDate: current ? null : String(form.get("endDate") ?? "") || null,
      description: String(form.get("description") ?? ""),
    };
    if (experience) void update.run({ id: experience.id, ...input });
    else void create.run(input);
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={experience ? "Edit entry" : "Add entry"}
      description="Shown on the resume section of your website."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Type">
          <Select options={KIND_OPTIONS} value={kind} onChange={(event) => setKind(event.target.value as ExperienceKind)} />
        </Field>
        <Field label={kind === "education" ? "Degree / course" : kind === "award" ? "Award" : "Role"} error={fieldErrors.title}>
          <Input name="title" defaultValue={experience?.title} required autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={kind === "education" ? "School" : kind === "award" ? "Organisation" : "Company / client"} error={fieldErrors.organization}>
            <Input name="organization" defaultValue={experience?.organization} required />
          </Field>
          <Field label="Location" error={fieldErrors.location}>
            <Input name="location" defaultValue={experience?.location} placeholder="Optional" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" error={fieldErrors.startDate}>
            <Input name="startDate" type="date" defaultValue={experience?.startDate} required />
          </Field>
          <Field label="End date" error={fieldErrors.endDate}>
            <Input name="endDate" type="date" defaultValue={experience?.endDate ?? ""} disabled={current} />
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
          <input type="checkbox" checked={current} onChange={(event) => setCurrent(event.target.checked)} className="size-4 accent-ink" />
          {kind === "education" ? "I'm currently studying here" : "This is ongoing"}
        </label>
        <Field label="Description" error={fieldErrors.description}>
          <Textarea name="description" defaultValue={experience?.description} rows={4} maxLength={2000} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {experience ? "Save changes" : "Add entry"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
