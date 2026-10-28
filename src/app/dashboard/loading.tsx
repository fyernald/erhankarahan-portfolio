import { Skeleton } from "@/components/ui/skeleton";

/** Generic skeleton shown while any dashboard page streams in. */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading">
      <div className="mb-2 flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-card" />
    </div>
  );
}
