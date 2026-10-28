"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signIn } from "@/lib/auth/client";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const { error: signInError } = await signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      rememberMe: form.get("remember") === "on",
    });

    if (signInError) {
      setPending(false);
      setError(
        signInError.status === 429
          ? "Too many attempts. Please wait a few minutes and try again."
          : "The email or password is incorrect.",
      );
      return;
    }
    // Keep the button busy while the dashboard loads.
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
      {error && (
        <div role="alert" className="animate-fade-in rounded-control border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}
      <Field label="Email">
        <Input name="email" type="email" autoComplete="username" required autoFocus placeholder="you@example.com" />
      </Field>
      <Field label="Password">
        <PasswordInput name="password" autoComplete="current-password" required />
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
        <input type="checkbox" name="remember" defaultChecked className="size-4 rounded accent-ink" />
        Keep me signed in
      </label>
      <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
        {pending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
