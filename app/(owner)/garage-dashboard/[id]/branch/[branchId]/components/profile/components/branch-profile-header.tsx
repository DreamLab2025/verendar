"use client";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SafeImage from "@/components/ui/SafeImage";
import { useBranchProfileBranch } from "@/hooks/useGarage";
import { getGarageBranchStatusLabelVi } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

type BranchProfileHeaderProps = {
  garageId: string;
  branchId: string;
};

function isPendingBranch(status: string): boolean {
  return status === "Pending";
}

export function BranchProfileHeader({ garageId, branchId }: BranchProfileHeaderProps) {
  const { isPending, isError, res, branchMe } = useBranchProfileBranch(garageId, branchId);

  if (isPending) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <Skeleton className="h-40 w-full rounded-none sm:h-44 md:h-48" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 md:px-9">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <Skeleton className="-mt-20 size-28 shrink-0 rounded-2xl border-4 border-background sm:-mt-24 sm:size-32" />
            <div className="min-w-0 space-y-2 sm:pb-1">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 shrink-0 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !res?.isSuccess || !res.data || !branchMe) {
    return null;
  }

  const branch = branchMe;
  const name = branch.name?.trim() || "Chi nhánh";
  const slug = branch.slug?.trim();
  const cover = branch.coverImageUrl?.trim();
  const pending = isPendingBranch(branch.status);
  const statusLabel = pending ? "Đang chờ duyệt" : getGarageBranchStatusLabelVi(branch.status);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="relative h-40 sm:h-44 md:h-48">
        {cover ? (
          <SafeImage
            src={cover}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0",
              "bg-linear-to-br from-primary/35 via-primary/18 to-muted/80",
              "dark:from-primary/22 dark:via-primary/12 dark:to-muted/45",
            )}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" aria-hidden />
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 md:px-9">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="-mt-20 shrink-0 sm:-mt-24">
            <div
              className={cn(
                "flex size-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-background shadow-md sm:size-32",
                "ring-1 ring-border/60",
              )}
            >
              {cover ? (
                <SafeImage src={cover} alt={name} width={128} height={128} className="size-full object-cover" />
              ) : (
                <Building2 className="size-12 text-muted-foreground sm:size-14" aria-hidden />
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-2.5 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">{name}</h1>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  pending
                    ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
                    : "border-border bg-muted/50 text-muted-foreground",
                )}
              >
                {statusLabel}
              </span>
            </div>
            {slug ? (
              <Badge variant="secondary" className="font-mono text-xs font-medium">
                {slug}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
