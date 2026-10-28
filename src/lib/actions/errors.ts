/**
 * An error whose message is safe to show to the user. Anything else thrown inside
 * an action is logged and replaced with a generic message so internals never leak.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} not found.`);
    this.name = "NotFoundError";
  }
}

/** Postgres unique violation → friendly field error. */
export function isUniqueViolation(error: unknown, constraintFragment?: string): boolean {
  const cause = (error as { cause?: unknown })?.cause ?? error;
  const pgError = cause as { code?: string; constraint?: string };
  if (pgError?.code !== "23505") return false;
  return constraintFragment ? Boolean(pgError.constraint?.includes(constraintFragment)) : true;
}
