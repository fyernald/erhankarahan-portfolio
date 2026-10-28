import Link from "next/link";

/** Wordmark with the soft blue mark from the design. */
export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${name} — home`}>
      <span className="relative flex size-6 items-center justify-center" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-mist-strong transition-transform group-hover:scale-110" />
        <span className="absolute top-1 left-1.5 size-2.5 rounded-full bg-white" />
      </span>
      <span className="font-display text-xl text-ink sm:text-[22px]">{name}</span>
    </Link>
  );
}
