"use client";

import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { siteButtonClassName } from "@/components/site/site-button";
import { useServerAction } from "@/hooks/use-server-action";
import { cn } from "@/lib/utils/cn";
import { submitContactMessage } from "../actions";

const underlineControl = cn(
  "peer w-full border-0 border-b border-ink/40 bg-transparent px-1.5 pt-2 pb-2.5 text-sm text-ink outline-none transition-colors",
  "placeholder:text-muted focus:border-ink aria-[invalid=true]:border-danger",
);

function UnderlineField({ label, error, multiline, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string[]; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      {multiline ? (
        <textarea
          name={props.name}
          required={props.required}
          maxLength={props.maxLength}
          placeholder={props.placeholder}
          rows={1}
          aria-invalid={Boolean(error)}
          className={cn(underlineControl, "field-sizing-content min-h-10 resize-none")}
        />
      ) : (
        <input {...props} aria-invalid={Boolean(error)} className={underlineControl} />
      )}
      {error && <span className="mt-1.5 block text-xs text-danger">{error[0]}</span>}
    </label>
  );
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = useServerAction(submitContactMessage, { onSuccess: () => setSent(true) });
  const errors = submit.fieldErrors;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void submit.run({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      website: String(form.get("website") ?? ""),
    });
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 py-6" role="status">
          <CheckCircle2 className="size-7 shrink-0 text-ink" strokeWidth={1.5} />
          <div>
            <p className="font-display text-2xl font-bold text-ink">Thank you!</p>
            <p className="mt-2 text-sm leading-relaxed text-body">Your message is on its way. I usually reply within two working days.</p>
            <button type="button" onClick={() => setSent(false)} className="mt-4 text-xs font-semibold tracking-[0.12em] text-ink uppercase underline underline-offset-8">
              Send another message
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0, y: -12 }} onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
          <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
            <UnderlineField label="Your name" name="name" placeholder="Your name" autoComplete="name" required maxLength={80} error={errors.name} />
            <UnderlineField label="Your e-mail address" name="email" type="email" placeholder="Your e-mail address" autoComplete="email" required maxLength={160} error={errors.email} />
          </div>
          <UnderlineField label="Your message" name="message" placeholder="Your message" required maxLength={4000} multiline error={errors.message} />
          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button type="submit" disabled={submit.pending} className={cn(siteButtonClassName, "mt-3 self-start")}>
            {submit.pending && <Spinner className="size-3.5" />}
            {submit.pending ? "Sending" : "Send it"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
