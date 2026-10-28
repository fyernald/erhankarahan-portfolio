"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Inbox as InboxIcon, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useServerAction } from "@/hooks/use-server-action";
import { cn } from "@/lib/utils/cn";
import { TimeAgo } from "@/components/ui/time-ago";
import { deleteMessage, markMessageRead } from "../actions";
import type { ContactMessage } from "../types";

export function Inbox({ messages: initialMessages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const mark = useServerAction(markMessageRead, { silentErrors: true, onSuccess: () => router.refresh() });
  const remove = useServerAction(deleteMessage, { successMessage: "Message deleted" });

  function setRead(message: ContactMessage, read: boolean) {
    setMessages((current) => current.map((entry) => (entry.id === message.id ? { ...entry, readAt: read ? new Date().toISOString() : null } : entry)));
    void mark.run({ id: message.id, read });
  }

  function toggle(message: ContactMessage) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && !message.readAt) setRead(message, true);
  }

  if (messages.length === 0) {
    return (
      <Card>
        <EmptyState icon={InboxIcon} title="Inbox zero" description="Messages sent through the contact form on your website will appear here." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <ul>
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <motion.li key={message.id} layout exit={{ opacity: 0, height: 0 }} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggle(message)}
                  aria-expanded={open}
                  className={cn("flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-canvas/60 sm:px-6", open && "bg-canvas/60")}
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", message.readAt ? "bg-transparent" : "bg-accent")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className={cn("text-sm text-ink", message.readAt ? "font-semibold" : "font-extrabold")}>
                        {message.name} <span className="font-normal text-muted">&lt;{message.email}&gt;</span>
                      </p>
                      <TimeAgo date={message.createdAt} className="text-xs text-muted" />
                    </div>
                    <p className={cn("mt-1 text-[13px] text-body", !open && "line-clamp-1")}>{open ? null : message.message}</p>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pl-11 sm:px-6 sm:pl-12">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{message.message}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent("Re: your message")}`}
                            className={buttonClassName("primary", "sm")}
                          >
                            <Reply className="size-3.5" /> Reply by email
                          </a>
                          <Button variant="secondary" size="sm" onClick={() => setRead(message, !message.readAt)}>
                            {message.readAt ? <Mail className="size-3.5" /> : <MailOpen className="size-3.5" />}
                            Mark as {message.readAt ? "unread" : "read"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-soft hover:text-danger" onClick={() => setPendingDelete(message)}>
                            <Trash2 className="size-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this message?"
        description={`The message from ${pendingDelete?.name} will be permanently deleted.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const result = await remove.run({ id: pendingDelete.id });
          if (!result.ok) return false;
          setMessages((current) => current.filter((entry) => entry.id !== pendingDelete.id));
          router.refresh();
        }}
      />
    </Card>
  );
}
