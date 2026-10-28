import { PageHeader } from "@/components/dashboard/page-header";
import { Inbox } from "@/features/messages/components/inbox";
import { listMessages } from "@/features/messages/queries";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await listMessages();
  const unread = messages.filter((message) => !message.readAt).length;
  return (
    <>
      <PageHeader title="Messages" description={unread ? `${unread} unread ${unread === 1 ? "message" : "messages"}` : "You're all caught up."} />
      <Inbox messages={messages} />
    </>
  );
}
