"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult, FieldErrors } from "@/lib/actions/result";

type Options<T> = {
  successMessage?: string | ((data: T) => string);
  onSuccess?: (data: T) => void;
  /** Suppress the error toast (e.g. when errors are shown inline instead). */
  silentErrors?: boolean;
};

/**
 * Runs a server action inside a transition and turns its `ActionResult` into UI
 * state: pending flag, inline field errors and toast notifications.
 */
export function useServerAction<Input, Output>(
  action: (input: Input) => Promise<ActionResult<Output>>,
  options: Options<Output> = {},
) {
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { successMessage, onSuccess, silentErrors } = options;

  const run = useCallback(
    (input: Input) =>
      new Promise<ActionResult<Output>>((resolve) => {
        startTransition(async () => {
          let result: ActionResult<Output>;
          try {
            result = await action(input);
          } catch {
            result = { ok: false, error: "Network error. Please check your connection." };
          }

          if (result.ok) {
            setFieldErrors({});
            const message = typeof successMessage === "function" ? successMessage(result.data) : (result.message ?? successMessage);
            if (message) toast.success(message);
            onSuccess?.(result.data);
          } else {
            setFieldErrors(result.fieldErrors ?? {});
            if (!silentErrors) toast.error(result.error);
          }
          resolve(result);
        });
      }),
    [action, onSuccess, silentErrors, successMessage],
  );

  return { run, pending, fieldErrors, setFieldErrors };
}
