"use client";

import { useMemo } from "react";
import { Copy, MapPin, Phone, Share2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatGarageBranchAddress,
  getGarageBranchStatusLabelVi,
  type GarageBranchDto,
} from "@/lib/api/services/fetchGarage";
import { useGarageBranchesInfinite } from "@/hooks/useGarage";
import { cn } from "@/lib/utils";

interface BranchesCardProps {
  garageId: string;
  /** Lọc cục bộ trên dữ liệu đã tải (tên, slug, địa chỉ). */
  search?: string;
  /** Lọc theo đúng giá trị `branch.status`. */
  statusFilter?: string;
  /** Gửi lên API qua `useGarageBranchesInfinite` (mặc định: không gửi). */
  isDescending?: boolean;
}

function isPendingBranch(status: string): boolean {
  return status === "Pending";
}

function filterBranches(list: GarageBranchDto[], search: string, statusFilter: string): GarageBranchDto[] {
  let next = list;
  const q = search.trim().toLowerCase();
  if (q) {
    next = next.filter((b) => {
      const name = (b.name ?? "").toLowerCase();
      const slug = (b.slug ?? "").toLowerCase();
      const addr = formatGarageBranchAddress(b.address).toLowerCase();
      const phone = (b.phoneNumber ?? "").toLowerCase();
      return name.includes(q) || slug.includes(q) || addr.includes(q) || phone.includes(q);
    });
  }
  const st = statusFilter.trim();
  if (st) {
    next = next.filter((b) => b.status === st);
  }
  return next;
}

export function BranchesCard({
  garageId,
  search = "",
  statusFilter = "",
  isDescending,
}: BranchesCardProps) {
  const {
    branches: rawBranches,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGarageBranchesInfinite(garageId, { isDescending }, { pageSize: 20 });

  const branches = useMemo(
    () => filterBranches(rawBranches, search, statusFilter),
    [rawBranches, search, statusFilter],
  );

  const rawCount = rawBranches.length;
  const total = branches.length;

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-0 space-y-0 overflow-hidden rounded-lg border">
            <Skeleton className="aspect-4/3 w-full min-h-48 rounded-none sm:min-h-56 md:min-h-64" />
            <div className="space-y-3 p-4 sm:p-5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="text-destructive">{error?.message ?? "Không tải được danh sách chi nhánh."}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (rawCount === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có chi nhánh nào.
      </p>
    );
  }

  if (total === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Không có chi nhánh phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {branches.map((branch) => {
          const pending = isPendingBranch(branch.status);
          const statusLabel = pending ? "Đang chờ duyệt" : getGarageBranchStatusLabelVi(branch.status);
          const addressLine = formatGarageBranchAddress(branch.address);

          return (
            <div key={branch.id} className="min-w-0">
              <Card className={cn("gap-0 overflow-hidden p-0", isRefetching && "opacity-80")}>
                <div className="relative aspect-4/3 w-full min-h-48 bg-muted sm:min-h-56 md:min-h-64">
                  <div className="absolute inset-0 bg-linear-to-b from-muted to-muted/60" aria-hidden />
                  <span className="sr-only">
                    Bản đồ (tạm trống). Tọa độ {branch.latitude}, {branch.longitude}
                  </span>
                  <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                        Chi nhánh
                      </span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                        pending
                          ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <CardContent className="space-y-3 p-4 sm:p-5">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                      {branch.name?.trim() || "—"}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">{branch.slug?.trim() || "—"}</CardDescription>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4 shrink-0 stroke-[1.5]" aria-hidden />
                      <span className="tabular-nums">{branch.phoneNumber?.trim() || "—"}</span>
                    </p>
                    <div className="flex shrink-0 items-center text-muted-foreground">
                      <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Chia sẻ">
                        <Share2 className="size-4 stroke-[1.5]" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Xóa">
                        <Trash2 className="size-4 stroke-[1.5]" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg" aria-label="Sao chép">
                        <Copy className="size-4 stroke-[1.5]" />
                      </Button>
                    </div>
                  </div>

                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 stroke-[1.5]" aria-hidden />
                    <span>{addressLine}</span>
                  </p>
                </CardContent>

                <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
                  <Button type="button" variant="outline" className="h-9 rounded-lg text-sm font-medium">
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    className="h-9 rounded-lg bg-foreground text-sm font-medium text-background hover:bg-foreground/90"
                  >
                    Xem
                  </Button>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
          </Button>
        </div>
      ) : null}
    </>
  );
}
