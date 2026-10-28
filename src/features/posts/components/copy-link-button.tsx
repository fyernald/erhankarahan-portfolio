"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-ink uppercase"
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
