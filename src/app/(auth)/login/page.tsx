import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeDashboardRedirect } from "@/lib/utils/safe-redirect";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const redirectTo = safeDashboardRedirect(next);

  // Resolved on the server before any HTML is sent: an active session never sees the form.
  if (await getCurrentUser()) redirect(redirectTo);

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-mist p-12 lg:flex">
        <Link href="/" className="font-display text-2xl text-ink">
          Erhan Karahan
        </Link>
        <div className="max-w-md">
          <p className="font-display text-4xl leading-tight font-bold text-ink">
            Every frame tells a story. Keep yours organised.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-body">
            Publish journal entries, curate your portfolio and keep your resume up to date — all from one place.
          </p>
        </div>
        <p className="text-xs text-muted">© {new Date().getFullYear()} Erhan Karahan Studio</p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full border border-mist-strong" aria-hidden />
        <div className="pointer-events-none absolute -right-8 -bottom-8 size-64 rounded-full border border-mist-strong" aria-hidden />
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm animate-fade-up">
          <Link href="/" className="mb-10 block font-display text-2xl text-ink lg:hidden">
            Erhan Karahan
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your website.</p>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </section>
    </main>
  );
}
