"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ContentEditorLayout } from "@/components/content-editor/content-editor-layout";
import { PublishCard } from "@/components/content-editor/publish-card";
import { TitleField } from "@/components/content-editor/title-field";
import { RichTextEditor } from "@/components/rich-text-editor/rich-text-editor";
import { GalleryField } from "@/features/media/components/gallery-field";
import { MediaField } from "@/features/media/components/media-field";
import type { MediaItem } from "@/features/media/types";
import type { PostStatus } from "@/features/posts/types";
import { useDirtyState } from "@/hooks/use-dirty-state";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useServerAction } from "@/hooks/use-server-action";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { EMPTY_DOCUMENT_JSON } from "@/lib/rich-text/empty-document";
import { toPlainDocument } from "@/lib/rich-text/plain-json";
import { slugify } from "@/lib/utils/slugify";
import { createProject, deleteProject, updateProject } from "../actions";
import type { ProjectDetail } from "../types";

type ProjectFormProps = { project?: ProjectDetail; categories: string[] };

export function ProjectForm({ project, categories }: ProjectFormProps) {
  const router = useRouter();
  const isNew = !project;
  const { dirty, setDirty, track } = useDirtyState();

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [category, setCategory] = useState(project?.category ?? "Photography");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [year, setYear] = useState(project?.year ? String(project.year) : String(new Date().getFullYear()));
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [cover, setCover] = useState<MediaItem | null>(project?.cover ?? null);
  const [gallery, setGallery] = useState<MediaItem[]>(project?.gallery ?? []);
  const [status, setStatus] = useState<PostStatus>(project?.status ?? "draft");
  const [initialContent] = useState<JSONContent>(() => (project?.content as JSONContent) ?? EMPTY_DOCUMENT_JSON);
  const content = useRef<JSONContent>(initialContent);
  const successMessage = useRef("Saved");

  useUnsavedChangesWarning(dirty);

  const create = useServerAction(createProject, {
    successMessage: () => successMessage.current,
    onSuccess: ({ id }) => {
      setDirty(false);
      router.replace(`/dashboard/projects/${id}`);
    },
  });
  const update = useServerAction(updateProject, {
    successMessage: () => successMessage.current,
    onSuccess: ({ slug: savedSlug }) => {
      setDirty(false);
      setSlug(savedSlug);
      router.refresh();
    },
  });
  const remove = useServerAction(deleteProject, { successMessage: "Project deleted" });

  const saving = create.pending || update.pending;
  const fieldErrors = isNew ? create.fieldErrors : update.fieldErrors;

  function save(nextStatus: PostStatus = status) {
    if (saving) return;
    setStatus(nextStatus);
    successMessage.current = nextStatus === "published" ? "Project saved and visible" : "Project saved as draft";
    const parsedYear = Number.parseInt(year, 10);
    const input = {
      title,
      slug,
      category,
      summary,
      client,
      year: Number.isFinite(parsedYear) ? parsedYear : null,
      featured,
      status: nextStatus,
      coverMediaId: cover?.id ?? null,
      galleryMediaIds: gallery.map((item) => item.id),
      content: toPlainDocument(content.current),
    };
    if (isNew) void create.run(input);
    else void update.run({ id: project.id, ...input });
  }

  useSaveShortcut(() => save());

  return (
    <ContentEditorLayout
      document={
        <>
          <TitleField
            value={title}
            placeholder="Project title"
            error={fieldErrors.title}
            onChange={(value) => {
              track(setTitle)(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
          />
          <RichTextEditor
            initialContent={initialContent}
            placeholder="Describe the project, the idea and how it was made…"
            onChange={(json) => {
              content.current = json;
              setDirty(true);
            }}
          />
        </>
      }
      below={
        <Card>
          <CardHeader title="Gallery" description="Photos and clips shown on the project page, in this order." />
          <CardBody>
            <GalleryField value={gallery} onChange={track(setGallery)} />
          </CardBody>
        </Card>
      }
      sidebar={
        <>
          <PublishCard
            status={status}
            savedStatus={project?.status}
            saving={saving}
            dirty={dirty || isNew}
            onSave={save}
            publicHref={project ? `/portfolio/${project.slug}` : undefined}
            deletion={
              project && {
                title: "Delete this project?",
                description: `"${project.title}" will be removed from your portfolio. Media files stay in your library.`,
                onConfirm: async () => {
                  const result = await remove.run({ id: project.id });
                  if (!result.ok) return false;
                  setDirty(false);
                  router.replace("/dashboard/projects");
                },
              }
            }
          >
            <Switch checked={featured} onCheckedChange={track(setFeatured)} label="Featured" description="Highlight on the home page" />
          </PublishCard>

          <Card>
            <CardHeader title="Details" />
            <CardBody className="flex flex-col gap-4">
              <Field label="Category" error={fieldErrors.category} hint="e.g. Photography, Film, Commercial">
                <Input value={category} onChange={(event) => track(setCategory)(event.target.value)} list="project-categories" />
              </Field>
              <datalist id="project-categories">
                {categories.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <Field label="Client" error={fieldErrors.client}>
                  <Input value={client} onChange={(event) => track(setClient)(event.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Year" error={fieldErrors.year}>
                  <Input value={year} onChange={(event) => track(setYear)(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" />
                </Field>
              </div>
              <Field label="Summary" error={fieldErrors.summary} hint="One or two sentences for cards and previews.">
                <Textarea value={summary} onChange={(event) => track(setSummary)(event.target.value)} rows={3} maxLength={400} />
              </Field>
              <Field label="URL slug" error={fieldErrors.slug} hint={`/portfolio/${slug || "your-project"}`}>
                <Input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    track(setSlug)(slugify(event.target.value));
                  }}
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cover image" />
            <CardBody>
              <MediaField label="Cover" value={cover} onChange={track(setCover)} aspect="portrait" />
            </CardBody>
          </Card>
        </>
      }
    />
  );
}
