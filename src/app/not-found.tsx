import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-bold text-mist-strong">404</p>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">This frame is missing</h1>
      <p className="mt-3 max-w-md text-sm text-body">The page you are looking for has moved or never existed.</p>
      <Link href="/" className="mt-10 inline-flex h-12 items-center bg-ink px-7 text-xs font-semibold tracking-[0.12em] text-white uppercase">
        Back home
      </Link>
    </main>
  );
}
