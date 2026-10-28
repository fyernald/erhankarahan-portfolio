import Link from "next/link";
import { BriefcaseBusiness, Images, Inbox, Newspaper, Plus, Upload } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatBytes } from "@/lib/utils/format";
import { getDashboardOverview } from "@/features/overview/queries";
import { ActivityCard } from "@/features/overview/components/activity-card";
import { RecentMessagesCard } from "@/features/overview/components/recent-messages-card";
import { RecentPostsCard } from "@/features/overview/components/recent-posts-card";
import { StatTile } from "@/features/overview/components/stat-tile";
import { StorageCard } from "@/features/overview/components/storage-card";

export const metadata = { title: "Overview" };

export default async function DashboardOverviewPage() {
  const overview = await getDashboardOverview();
  const { counts } = overview;
  const totalBytes = overview.storage.reduce((sum, entry) => sum + entry.bytes, 0);
  const drafts = counts.posts - counts.publishedPosts;

  return (
    <>
      <PageHeader
        title="Overview"
        description="A snapshot of your website and recent activity."
        actions={
          <>
            <Link href="/dashboard/media" className={buttonClassName("secondary")}>
              <Upload className="size-4" /> Upload
            </Link>
            <Link href="/dashboard/posts/new" className={buttonClassName("primary")}>
              <Plus className="size-4" /> New post
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key figures">
          <StatTile
            label="Published posts"
            value={String(counts.publishedPosts)}
            detail={`${drafts} ${drafts === 1 ? "draft" : "drafts"} in progress`}
            icon={Newspaper}
            href="/dashboard/posts"
          />
          <StatTile label="Portfolio projects" value={String(counts.projects)} detail="Shown on your works page" icon={BriefcaseBusiness} href="/dashboard/projects" />
          <StatTile label="Media files" value={String(counts.media)} detail={`${formatBytes(totalBytes)} stored`} icon={Images} href="/dashboard/media" />
          <StatTile
            label="Unread messages"
            value={String(counts.unreadMessages)}
            detail="From your contact form"
            icon={Inbox}
            href="/dashboard/messages"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ActivityCard activity={overview.activity} />
          <StorageCard storage={overview.storage} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <RecentPostsCard posts={overview.recentPosts} />
          <RecentMessagesCard messages={overview.recentMessages} />
        </section>
      </div>
    </>
  );
}
