import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in to perform this action.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Data Access Layer entry point: reads and verifies the session on the server.
 * Memoised per request so layouts, pages and actions share one lookup.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, image } = session.user;
  const role = (session.user as { role?: string }).role ?? "admin";
  return { id, name, email, image: image ?? null, role };
});

/** For pages/layouts: redirects anonymous visitors to the login page. */
export async function requireUserOrRedirect(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");
  return user;
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new UnauthorizedError();
  return user;
}
