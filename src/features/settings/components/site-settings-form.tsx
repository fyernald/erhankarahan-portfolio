"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SaveState } from "@/components/dashboard/save-state";
import { MediaField } from "@/features/media/components/media-field";
import type { MediaItem } from "@/features/media/types";
import { useDirtyState } from "@/hooks/use-dirty-state";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useServerAction } from "@/hooks/use-server-action";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { updateSiteSettings } from "../actions";
import { SOCIAL_NETWORKS } from "../schemas";
import type { SiteSettings } from "../types";
import { SettingsSection } from "./settings-section";

type TextFields = Omit<SiteSettings, "socials" | "heroImage" | "aboutImage" | "contactImage" | "cvDocument" | "updatedAt">;
type ImageFields = Pick<SiteSettings, "heroImage" | "aboutImage" | "contactImage" | "cvDocument">;

const SOCIAL_LABELS: Record<(typeof SOCIAL_NETWORKS)[number], string> = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  pinterest: "Pinterest",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  vimeo: "Vimeo",
};

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { dirty, setDirty, track } = useDirtyState();
  const [text, setText] = useState<TextFields>(() => {
    const { socials, heroImage, aboutImage, contactImage, cvDocument, updatedAt, ...rest } = settings;
    void [socials, heroImage, aboutImage, contactImage, cvDocument, updatedAt];
    return rest;
  });
  const [images, setImages] = useState<ImageFields>({
    heroImage: settings.heroImage,
    aboutImage: settings.aboutImage,
    contactImage: settings.contactImage,
    cvDocument: settings.cvDocument,
  });
  const [socials, setSocials] = useState<Record<string, string>>(() => ({ ...settings.socials }) as Record<string, string>);

  const save = useServerAction(updateSiteSettings, {
    successMessage: "Website updated",
    onSuccess: () => {
      setDirty(false);
      router.refresh();
    },
  });
  const errors = save.fieldErrors;
  useUnsavedChangesWarning(dirty);

  const bind = (key: keyof TextFields) => ({
    value: text[key],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      track(setText)({ ...text, [key]: event.target.value }),
  });
  const setImage = (key: keyof ImageFields) => track((item: MediaItem | null) => setImages((current) => ({ ...current, [key]: item })));

  function submit() {
    void save.run({
      ...text,
      heroImageId: images.heroImage?.id ?? null,
      aboutImageId: images.aboutImage?.id ?? null,
      contactImageId: images.contactImage?.id ?? null,
      cvDocumentId: images.cvDocument?.id ?? null,
      socials,
    });
  }
  useSaveShortcut(submit);

  return (
    <form
      className="flex flex-col gap-10"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <SettingsSection title="Profile" description="Your name and how people can reach you. Shown in the header, footer and contact section.">
        <Field label="Display name" error={errors.ownerName}>
          <Input {...bind("ownerName")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Public email" error={errors.email}>
            <Input type="email" {...bind("email")} placeholder="hello@erhankarahan.com" />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input {...bind("phone")} placeholder="Optional" />
          </Field>
        </div>
        <Field label="Location" error={errors.location}>
          <Input {...bind("location")} placeholder="Istanbul, Türkiye" />
        </Field>
      </SettingsSection>

      <SettingsSection title="Hero" description="The first thing visitors see on your home page.">
        <Field label="Headline" error={errors.heroTitle}>
          <Input {...bind("heroTitle")} />
        </Field>
        <Field label="Subheadline" error={errors.heroSubtitle}>
          <Input {...bind("heroSubtitle")} />
        </Field>
        <MediaField label="Hero image" value={images.heroImage} onChange={setImage("heroImage")} aspect="square" hint="A portrait or square photo works best." />
      </SettingsSection>

      <SettingsSection title="About" description="Your story. Separate paragraphs with an empty line.">
        <Field label="Section title" error={errors.aboutTitle}>
          <Input {...bind("aboutTitle")} />
        </Field>
        <Field label="Biography" error={errors.aboutBody}>
          <Textarea {...bind("aboutBody")} rows={9} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField label="About image" value={images.aboutImage} onChange={setImage("aboutImage")} aspect="portrait" />
          <MediaField label="Downloadable CV" value={images.cvDocument} onChange={setImage("cvDocument")} kinds={["document"]} hint="PDF recommended." />
        </div>
      </SettingsSection>

      <SettingsSection title="Contact" description="Text and photo next to the contact form.">
        <Field label="Section title" error={errors.contactTitle}>
          <Input {...bind("contactTitle")} />
        </Field>
        <Field label="Intro" error={errors.contactIntro}>
          <Textarea {...bind("contactIntro")} rows={2} />
        </Field>
        <MediaField label="Contact image" value={images.contactImage} onChange={setImage("contactImage")} aspect="portrait" hint="A cut-out or portrait photo." />
      </SettingsSection>

      <SettingsSection title="Social links" description="Leave empty to hide a network. Links must start with https://.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_NETWORKS.map((network) => (
            <Field key={network} label={SOCIAL_LABELS[network]} error={errors[`socials.${network}`] ?? errors.socials}>
              <Input
                value={socials[network] ?? ""}
                onChange={(event) => track(setSocials)({ ...socials, [network]: event.target.value })}
                placeholder={`https://${network}.com/…`}
              />
            </Field>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Search engines" description="How your site appears on Google and when links are shared.">
        <Field label="Site title" error={errors.seoTitle}>
          <Input {...bind("seoTitle")} />
        </Field>
        <Field label="Description" error={errors.seoDescription} hint={`${text.seoDescription.length}/300`}>
          <Textarea {...bind("seoDescription")} rows={3} maxLength={300} />
        </Field>
      </SettingsSection>

      <div className="sticky bottom-4 z-20 flex items-center justify-end gap-4 rounded-card border border-line bg-surface/95 px-5 py-3 shadow-popover backdrop-blur">
        <SaveState saving={save.pending} dirty={dirty} />
        <Button type="submit" loading={save.pending} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
