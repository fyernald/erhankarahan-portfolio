"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { changePassword } from "@/lib/auth/client";
import { SettingsSection } from "./settings-section";

const MIN_LENGTH = 12;

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    const nextErrors: Record<string, string> = {};
    if (newPassword.length < MIN_LENGTH) nextErrors.newPassword = `Use at least ${MIN_LENGTH} characters`;
    if (newPassword !== confirmation) nextErrors.confirmation = "Passwords don't match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setPending(true);
    const { error } = await changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    setPending(false);
    if (error) {
      setErrors({ currentPassword: error.status === 429 ? "Too many attempts, try again later" : "Current password is incorrect" });
      return;
    }
    formElement.reset();
    toast.success("Password changed. Other devices were signed out.");
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsSection title="Password" description="Changing your password signs you out on every other device.">
        <Field label="Current password" error={errors.currentPassword}>
          <PasswordInput name="currentPassword" autoComplete="current-password" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" error={errors.newPassword} hint={`At least ${MIN_LENGTH} characters`}>
            <PasswordInput name="newPassword" autoComplete="new-password" required />
          </Field>
          <Field label="Confirm new password" error={errors.confirmation}>
            <PasswordInput name="confirmation" autoComplete="new-password" required />
          </Field>
        </div>
        <Button type="submit" className="self-end" loading={pending}>
          Update password
        </Button>
      </SettingsSection>
    </form>
  );
}
