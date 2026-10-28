export type ExperienceKind = "work" | "education" | "award";

export type Experience = {
  id: string;
  kind: ExperienceKind;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  sortOrder: number;
};

export type Skill = {
  id: string;
  name: string;
  group: string;
  level: number;
  sortOrder: number;
};

export const EXPERIENCE_KIND_LABELS: Record<ExperienceKind, string> = {
  work: "Experience",
  education: "Education",
  award: "Awards",
};
