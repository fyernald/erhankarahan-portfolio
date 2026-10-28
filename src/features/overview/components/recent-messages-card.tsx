import Link from "next/link";
import { Inbox } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ContactMessage } from "@/features/messages/types";

export function RecentMessagesCard({ messages }: { messages: ContactMessage[] }) {
  return (
    <Card>
      <CardHeader
        title="Inbox"
        description="Messages from your contact form"
        action={
          <Link href="/dashboard/messages" className={buttonClassName("ghost", "sm")}>
            Open
          </Link>
        }
      />
      {messages.length === 0 ? (
        <EmptyState icon={Inbox} title="No messages yet" description="When someone writes to you, it will appear here." />
      ) : (
        <ul className="divide-y divide-line">
          {messages.map((message) => (
            <li key={message.id} className="flex gap-3 px-5 py-3.5 sm:px-6">
              <span
                className={cn("mt-1.5 size-2 shrink-0 rounded-full", message.readAt ? "bg-transparent" : "bg-accent")}
                aria-label={message.readAt ? undefined : "Unread"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm text-ink", message.readAt ? "font-semibold" : "font-extrabold")}>{message.name}</p>
                  <span className="shrink-0 text-xs text-muted">{formatRelative(message.createdAt)}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-body">{message.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
