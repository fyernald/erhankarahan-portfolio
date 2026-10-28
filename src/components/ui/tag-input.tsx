"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { controlClassName } from "./input";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  placeholder?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Chip input: Enter or comma adds a tag, Backspace on empty input removes the last one. */
export function TagInput({ value, onChange, max = 12, placeholder = "Add a tag…", ...aria }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const tag = raw.trim().toLowerCase().slice(0, 32);
    if (!tag || value.includes(tag) || value.length >= max) return setDraft("");
    onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn(controlClassName, "flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/5")}>
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-ink animate-fade-in">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((item) => item !== tag))} aria-label={`Remove ${tag}`} className="text-muted hover:text-ink">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        {...aria}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={value.length >= max ? "" : placeholder}
        disabled={value.length >= max}
        className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted"
      />
    </div>
  );
}
