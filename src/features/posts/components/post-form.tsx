"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { ContentEditorLayout } from "@/components/content-editor/content-editor-layout";
import { PublishCard } from "@/components/content-editor/publish-card";
import { TitleField } from "@/components/content-editor/title-field";
import { RichTextEditor } from "@/components/rich-text-editor/rich-text-editor";
import { MediaField } from "@/features/media/components/media-field";
import type { MediaItem } from "@/features/media/types";
import { useDirtyState } from "@/hooks/use-dirty-state";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useServerAction } from "@/hooks/use-server-action";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { EMPTY_DOCUMENT_JSON } from "@/lib/rich-text/empty-document";
import { toPlainDocument } from "@/lib/rich-text/plain-json";
import { slugify } from "@/lib/utils/slugify";
import { createPost, deletePost, updatePost } from "../actions";
import type { PostDetail, PostStatus } from "../types";

export function PostForm({ post }: { post?: PostDetail }) {
  const router = useRouter();
  const isNew = !post;
  const { dirty, setDirty, track } = useDirtyState();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [cover, setCover] = useState<MediaItem | null>(post?.cover ?? null);
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [initialContent] = useState<JSONContent>(() => (post?.content as JSONContent) ?? EMPTY_DOCUMENT_JSON);
  const content = useRef<JSONContent>(initialContent);
  const successMessage = useRef("Saved");

  useUnsavedChangesWarning(dirty);

  const create = useServerAction(createPost, {
    successMessage: () => successMessage.current,
    onSuccess: ({ id }) => {
      setDirty(false);
      router.replace(`/dashboard/posts/${id}`);
    },
  });
  const update = useServerAction(updatePost, {
    successMessage: () => successMessage.current,
    onSuccess: ({ slug: savedSlug }) => {
      setDirty(false);
      setSlug(savedSlug);
      router.refresh();
    },
  });
  const remove = useServerAction(deletePost, { successMessage: "Post deleted" });

  const saving = create.pending || update.pending;
  const fieldErrors = isNew ? create.fieldErrors : update.fieldErrors;

  function save(nextStatus: PostStatus = status) {
    if (saving) return;
    setStatus(nextStatus);
    successMessage.current =
      nextStatus === "published" ? (post?.status === "published" ? "Post updated" : "Post published") : "Draft saved";
    const input = {
      title,
      slug,
      excerpt,
      tags,
      status: nextStatus,
      coverMediaId: cover?.id ?? null,
      content: toPlainDocument(content.current),
    };
    if (isNew) void create.run(input);
    else void update.run({ id: post.id, ...input });
  }

  useSaveShortcut(() => save());

  return (
    <ContentEditorLayout
      document={
        <>
          <TitleField
            value={title}
            placeholder="Post title"
            error={fieldErrors.title}
            onChange={(value) => {
              track(setTitle)(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
          />
          <RichTextEditor
            initialContent={initialContent}
            onChange={(json) => {
              content.current = json;
              setDirty(true);
            }}
          />
        </>
      }
      sidebar={
        <>
          <PublishCard
            status={status}
            savedStatus={post?.status}
            saving={saving}
            dirty={dirty || isNew}
            onSave={save}
            publicHref={post ? `/blog/${post.slug}` : undefined}
            deletion={
              post && {
                title: "Delete this post?",
                description: `"${post.title}" will be permanently removed from your blog. This cannot be undone.`,
                onConfirm: async () => {
                  const result = await remove.run({ id: post.id });
                  if (!result.ok) return false;
                  setDirty(false);
                  router.replace("/dashboard/posts");
                },
              }
            }
          />

          <Card>
            <CardHeader title="Details" />
            <CardBody className="flex flex-col gap-4">
              <Field label="URL slug" error={fieldErrors.slug} hint={`/blog/${slug || "your-post"}`}>
                <Input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    track(setSlug)(slugify(event.target.value));
                  }}
                  placeholder="generated-from-title"
                />
              </Field>
              <Field label="Excerpt" error={fieldErrors.excerpt} hint={`${excerpt.length}/320 · Leave empty to use the first lines`}>
                <Textarea value={excerpt} onChange={(event) => track(setExcerpt)(event.target.value)} rows={3} maxLength={320} />
              </Field>
              <Field label="Tags" error={fieldErrors.tags} hint="Press Enter or comma to add">
                <TagInput value={tags} onChange={track(setTags)} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cover image" />
            <CardBody>
              <MediaField label="Cover" value={cover} onChange={track(setCover)} hint="Shown on the blog list and when shared." />
            </CardBody>
          </Card>
        </>
      }
    />
  );
}
