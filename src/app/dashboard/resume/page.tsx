import { PageHeader } from "@/components/dashboard/page-header";
import { ResumeManager } from "@/features/resume/components/resume-manager";
import { listExperiences, listSkills } from "@/features/resume/queries";

export const metadata = { title: "Resume" };

export default async function ResumePage() {
  const [experiences, skills] = await Promise.all([listExperiences(), listSkills()]);
  return (
    <>
      <PageHeader title="Resume" description="Experience, education, awards and skills shown on your About page." />
      <ResumeManager experiences={experiences} skills={skills} />
    </>
  );
}
