import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_COUNT = 8;

export function RequiresBookingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 gap-3">
              <Skeleton className="size-12 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-full max-w-56 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="size-4 shrink-0 rounded" />
            <Skeleton className="h-4 w-full max-w-xs rounded" />
          </div>
          <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
