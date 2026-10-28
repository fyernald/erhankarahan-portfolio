import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { MediaImage } from "@/features/media/components/media-image";
import { CopyLinkButton } from "@/features/posts/components/copy-link-button";
import { PostCard, PostMeta } from "@/features/posts/components/post-card";
import { getPublishedPostBySlug, listRelatedPosts } from "@/features/posts/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { JsonLd } from "@/features/site/components/json-ld";
import { buildSiteMetadata } from "@/features/site/metadata";
import { RichTextContent } from "@/components/site/rich-text-content";
import { SectionHeading } from "@/components/site/section-heading";
import { SLUG_PATTERN } from "@/lib/utils/slugify";

async function loadPost(slug: string) {
  return SLUG_PATTERN.test(slug) ? getPublishedPostBySlug(slug) : null;
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Not found" };
  const image = post.cover?.url;
  return buildSiteMetadata({
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: post.publishedAt ?? undefined,
      tags: post.tags,
      images: image ? [{ url: image }] : undefined,
    },
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  const [related, settings] = await Promise.all([listRelatedPosts(post), getSiteSettings()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: { "@type": "Person", name: settings.ownerName },
          image: post.cover?.url,
          keywords: post.tags.join(", "),
        }}
      />
      <article>
        <header className="container-page animate-fade-up pt-10 pb-12 text-center lg:pt-16 lg:pb-16">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-muted uppercase transition-colors hover:text-ink">
            <ArrowLeft className="size-3.5" /> Journal
          </Link>
          <div className="mx-auto mt-10 max-w-3xl">
            <PostMeta post={post} />
            <h1 className="mt-5 font-display text-4xl leading-tight font-bold text-ink sm:text-5xl lg:text-[56px]">{post.title}</h1>
            {post.excerpt && <p className="mx-auto mt-6 max-w-2xl text-base leading-loose text-body">{post.excerpt}</p>}
          </div>
        </header>

        {post.cover && (
          <div className="container-page">
            <MediaImage item={post.cover} alt={post.cover.alt || post.title} sizes="(min-width: 1200px) 1136px, 100vw" priority className="aspect-[16/9] w-full" />
          </div>
        )}

        <div className="container-page py-16 lg:py-20">
          <RichTextContent html={post.contentHtml} className="mx-auto max-w-[720px]" />
          <footer className="mx-auto mt-16 flex max-w-[720px] flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="inline-block bg-mist px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-mist-strong">
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
            <CopyLinkButton />
          </footer>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-page section-spacing border-t border-line" aria-label="More stories">
          <SectionHeading title="Keep reading" />
          <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
