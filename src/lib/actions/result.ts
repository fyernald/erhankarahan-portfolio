export type FieldErrors = Record<string, string[] | undefined>;

export type ActionSuccess<T> = { ok: true; data: T; message?: string };
export type ActionFailure = { ok: false; error: string; fieldErrors?: FieldErrors };
export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

export function success<T>(data: T, message?: string): ActionSuccess<T> {
  return { ok: true, data, message };
}

export function failure(error: string, fieldErrors?: FieldErrors): ActionFailure {
  return { ok: false, error, fieldErrors };
}
