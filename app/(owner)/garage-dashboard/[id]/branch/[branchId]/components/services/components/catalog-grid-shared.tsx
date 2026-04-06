"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Số card mỗi trang (2 hàng × 4 cột trên xl). */
export const CATALOG_PAGE_SIZE = 8;

export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm"
        >
          <Skeleton className="aspect-4/3 w-full shrink-0 rounded-none" />
          <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogGridPagination({
  pageIndex,
  pageCount,
  total,
  onPrev,
  onNext,
}: {
  pageIndex: number;
  pageCount: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (pageCount <= 1) return null;

  const page = pageIndex + 1;
  const from = pageIndex * CATALOG_PAGE_SIZE + 1;
  const to = Math.min((pageIndex + 1) * CATALOG_PAGE_SIZE, total);

  return (
    <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center">
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Hiển thị{" "}
        <span className="font-medium tabular-nums text-foreground">{from}</span>
        <span className="mx-0.5">–</span>
        <span className="font-medium tabular-nums text-foreground">{to}</span>
        <span className="mx-1 text-muted-foreground">/</span>
        <span className="font-medium tabular-nums text-foreground">{total}</span>
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          disabled={pageIndex <= 0}
          onClick={onPrev}
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-20 text-center text-sm tabular-nums text-foreground">
          {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          disabled={pageIndex >= pageCount - 1}
          onClick={onNext}
          aria-label="Trang sau"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
