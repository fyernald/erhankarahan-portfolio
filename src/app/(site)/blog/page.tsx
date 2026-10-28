import { Newspaper } from "lucide-react";
import { PostCard } from "@/features/posts/components/post-card";
import { listPublishedPosts, listPublishedTags } from "@/features/posts/queries";
import { buildSiteMetadata } from "@/features/site/metadata";
import { FilterChips } from "@/components/site/filter-chips";
import { PageIntro } from "@/components/site/page-intro";
import { SitePagination } from "@/components/site/site-pagination";
import { toPage } from "@/lib/utils/pagination";

export const generateMetadata = () => buildSiteMetadata({ title: "Blog", alternates: { canonical: "/blog" } });

const PAGE_SIZE = 9;

function blogHref(tag: string | undefined, page = 1) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const tags = await listPublishedTags();
  const tag = typeof params.tag === "string" && tags.includes(params.tag) ? params.tag : undefined;
  const page = toPage(params.page);
  const result = await listPublishedPosts({ page, pageSize: PAGE_SIZE, tag });
  const showFeatured = page === 1 && !tag && result.items.length > 0;
  const [featured, ...rest] = showFeatured ? result.items : [undefined, ...result.items];

  return (
    <>
      <PageIntro title="Journal" description="Stories from shoots, travels and the craft behind the camera.">
        <FilterChips
          label="Filter by tag"
          items={[{ label: "All", href: "/blog", active: !tag }, ...tags.map((name) => ({ label: name, href: blogHref(name), active: name === tag }))]}
        />
      </PageIntro>
      <section className="container-page pb-24 lg:pb-32" aria-label="Posts">
        {result.items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 bg-mist px-6 py-24 text-center">
            <Newspaper className="size-8 text-ink" strokeWidth={1.25} />
            <p className="font-display text-2xl font-bold text-ink">No stories yet</p>
            <p className="text-sm text-body">The first journal entries are being written.</p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-20 animate-fade-up border-b border-line pb-20">
                <PostCard post={featured} variant="featured" />
              </div>
            )}
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.filter(Boolean).map((post, index) => (
                <div key={post!.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}>
                  <PostCard post={post!} />
                </div>
              ))}
            </div>
            <SitePagination page={result.page} pageCount={result.pageCount} hrefFor={(target) => blogHref(tag, target)} />
          </>
        )}
      </section>
    </>
  );
}
