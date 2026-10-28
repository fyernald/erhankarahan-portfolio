import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { SearchField } from "@/components/dashboard/search-field";
import { MediaLibrary } from "@/features/media/components/media-library";
import { listMedia } from "@/features/media/queries";
import { mediaKindFilterSchema } from "@/features/media/schemas";
import { toPage } from "@/lib/utils/pagination";

export const metadata = { title: "Media library" };

const PAGE_SIZE = 30;

export default async function MediaPage({ searchParams }: PageProps<"/dashboard/media">) {
  const params = await searchParams;
  const kind = mediaKindFilterSchema.parse(params.kind);
  const search = typeof params.q === "string" ? params.q.slice(0, 100) : undefined;
  const page = toPage(params.page);
  const result = await listMedia({ kind, search, page, pageSize: PAGE_SIZE });

  return (
    <>
      <PageHeader title="Media library" description={`${result.total} files · photos, videos and documents.`} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          param="kind"
          tabs={[
            { value: undefined, label: "All" },
            { value: "image", label: "Images" },
            { value: "video", label: "Videos" },
            { value: "document", label: "Documents" },
          ]}
        />
        <SearchField placeholder="Search files" />
      </div>
      <MediaLibrary items={result.items} filtered={Boolean(kind || search)} />
      <Pagination page={result.page} pageCount={result.pageCount} />
    </>
  );
}
