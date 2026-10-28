import "server-only";
import { z } from "zod";
import { requireAdmin, UnauthorizedError, type SessionUser } from "@/lib/auth/session";
import { DomainError } from "./errors";
import { failure, success, type ActionResult } from "./result";

type ActionContext = { user: SessionUser };

/**
 * Wraps a server action with the cross-cutting concerns every dashboard mutation needs:
 * authentication, input validation and safe error reporting.
 *
 * Server actions are public HTTP endpoints, so the session is re-verified on every call.
 */
export function adminAction<Schema extends z.ZodType, Output>(
  schema: Schema,
  handler: (input: z.output<Schema>, context: ActionContext) => Promise<Output | ActionResult<Output>>,
) {
  return async (rawInput: z.input<Schema>): Promise<ActionResult<Output>> => {
    try {
      const user = await requireAdmin();
      const parsed = schema.safeParse(rawInput);
      if (!parsed.success) {
        return failure("Please fix the highlighted fields.", z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
      }
      const result = await handler(parsed.data, { user });
      if (isActionResult<Output>(result)) return result;
      return success(result);
    } catch (error) {
      return toFailure(error);
    }
  };
}

function isActionResult<T>(value: unknown): value is ActionResult<T> {
  return typeof value === "object" && value !== null && "ok" in value && typeof value.ok === "boolean";
}

function toFailure(error: unknown) {
  if (error instanceof UnauthorizedError) return failure("Your session has expired. Please sign in again.");
  if (error instanceof DomainError) return failure(error.message, error.fieldErrors);
  // Next.js uses thrown errors for redirect()/notFound(); let them propagate.
  if (isNextControlFlowError(error)) throw error;
  console.error("[action] unexpected error", error);
  return failure("Something went wrong. Please try again.");
}

function isNextControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: unknown })?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK"));
}
