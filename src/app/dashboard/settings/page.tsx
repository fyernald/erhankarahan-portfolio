import { PageHeader } from "@/components/dashboard/page-header";
import { ChangePasswordForm } from "@/features/settings/components/change-password-form";
import { SiteSettingsForm } from "@/features/settings/components/site-settings-form";
import { getSiteSettings } from "@/features/settings/queries";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader title="Settings" description="Edit the content of your website and manage your account." />
      <div className="flex flex-col gap-10">
        <SiteSettingsForm key={settings.updatedAt} settings={settings} />
        <hr className="border-line" />
        <ChangePasswordForm />
      </div>
    </>
  );
}
