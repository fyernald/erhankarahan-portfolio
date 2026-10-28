"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { ExternalLink } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { SaveState } from "@/components/dashboard/save-state";
import { RichTextEditor } from "@/components/rich-text-editor/rich-text-editor";
import { MediaField } from "@/features/media/components/media-field";
import type { MediaItem } from "@/features/media/types";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useServerAction } from "@/hooks/use-server-action";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { toPlainDocument } from "@/lib/rich-text/plain-json";
import { slugify } from "@/lib/utils/slugify";
import { createPost, deletePost, updatePost } from "../actions";
import type { PostDetail, PostStatus } from "../types";
import { StatusBadge } from "./status-badge";

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export function PostForm({ post }: { post?: PostDetail }) {
  const router = useRouter();
  const isNew = !post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [cover, setCover] = useState<MediaItem | null>(post?.cover ?? null);
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [dirty, setDirty] = useState(false);
  const [initialContent] = useState<JSONContent>(() => (post?.content as JSONContent) ?? EMPTY_DOC);
  const content = useRef<JSONContent>(initialContent);

  useUnsavedChangesWarning(dirty);

  const markDirty = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setDirty(true);
  };

  const successMessage = useRef("Saved");
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
    const input = {
      title,
      slug,
      excerpt,
      tags,
      status: nextStatus,
      coverMediaId: cover?.id ?? null,
      content: toPlainDocument(content.current),
    };
    setStatus(nextStatus);
    successMessage.current =
      nextStatus === "published" ? (post?.status === "published" ? "Post updated" : "Post published") : "Draft saved";
    if (isNew) return create.run(input);
    return update.run({ id: post.id, ...input });
  }

  useSaveShortcut(() => void save());

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0 self-start">
        <div className="border-b border-line px-5 pt-8 pb-4 sm:px-10 lg:px-14">
          <textarea
            value={title}
            onChange={(event) => {
              markDirty(setTitle)(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="Post title"
            rows={1}
            aria-label="Title"
            aria-invalid={Boolean(fieldErrors.title)}
            className="field-sizing-content w-full resize-none bg-transparent font-display text-3xl leading-tight font-bold text-ink outline-none placeholder:text-line-strong sm:text-4xl"
          />
          {fieldErrors.title && <p className="mt-1 text-xs font-medium text-danger">{fieldErrors.title[0]}</p>}
        </div>
        <RichTextEditor
          initialContent={initialContent}
          onChange={(json) => {
            content.current = json;
            setDirty(true);
          }}
        />
      </Card>

      <aside className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader title="Publish" action={<StatusBadge status={status} />} />
          <CardBody className="flex flex-col gap-4">
            <SaveState saving={saving} dirty={dirty || isNew} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => save("draft")} loading={saving && status === "draft"} disabled={saving}>
                {status === "published" ? "Unpublish" : "Save draft"}
              </Button>
              <Button onClick={() => save("published")} loading={saving && status === "published"} disabled={saving}>
                {post?.status === "published" ? "Update" : "Publish"}
              </Button>
            </div>
            <p className="text-xs text-muted">Tip: press Ctrl/⌘ + S to save at any time.</p>
            {post && (
              <div className="flex items-center justify-between border-t border-line pt-4">
                {post.status === "published" ? (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className={buttonClassName("ghost", "sm")}>
                    <ExternalLink className="size-3.5" /> View post
                  </a>
                ) : (
                  <span className="text-xs text-muted">Not visible on the website</span>
                )}
                <DeleteButton
                  size="sm"
                  title="Delete this post?"
                  description={`"${post.title}" will be permanently removed from your blog. This cannot be undone.`}
                  onConfirm={async () => {
                    const result = await remove.run({ id: post.id });
                    if (!result.ok) return false;
                    setDirty(false);
                    router.replace("/dashboard/posts");
                  }}
                />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Details" />
          <CardBody className="flex flex-col gap-4">
            <Field label="URL slug" error={fieldErrors.slug} hint={`/blog/${slug || "your-post"}`}>
              <Input
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  markDirty(setSlug)(slugify(event.target.value));
                }}
                placeholder="generated-from-title"
              />
            </Field>
            <Field label="Excerpt" error={fieldErrors.excerpt} hint={`${excerpt.length}/320 · Leave empty to use the first lines`}>
              <Textarea value={excerpt} onChange={(event) => markDirty(setExcerpt)(event.target.value)} rows={3} maxLength={320} />
            </Field>
            <Field label="Tags" error={fieldErrors.tags} hint="Press Enter or comma to add">
              <TagInput value={tags} onChange={markDirty(setTags)} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cover image" />
          <CardBody>
            <MediaField label="Cover" value={cover} onChange={markDirty(setCover)} hint="Shown on the blog list and when shared." />
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
