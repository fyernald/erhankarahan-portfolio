import Link from "next/link";

export function DashboardBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-white">E</span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-ink">Erhan Karahan</span>
        <span className="text-xs text-muted">Studio dashboard</span>
      </span>
    </Link>
  );
}
