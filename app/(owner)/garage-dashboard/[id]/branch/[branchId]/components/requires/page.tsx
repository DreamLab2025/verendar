"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { BookingRequireDialog } from "@/components/dialog/booking-require/BookingRequireDialog";
import { Button } from "@/components/ui/button";
import { flattenInfinitePages, useBranchBookingsScrollInfinity } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

import {
  RequireBookingToolbar,
  type RequireBookingSortOrder,
} from "./components/require-booking-toolbar";
import { RequiresBookingCard } from "./components/requires-booking-card";
import { RequiresBookingsSkeleton } from "./components/requires-bookings-skeleton";

const GRID_PAGE_SIZE = 12;

function sortOrderToIsDescending(order: RequireBookingSortOrder): boolean | undefined {
  if (order === "default") return undefined;
  if (order === "desc") return true;
  return false;
}

export default function BranchRequiresPage() {
  const params = useParams<{ branchId: string }>();
  const branchId = typeof params.branchId === "string" ? params.branchId : undefined;

  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<RequireBookingSortOrder>("desc");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const isDescending = sortOrderToIsDescending(sortOrder);

  const q = useBranchBookingsScrollInfinity(undefined, {
    pageSize: GRID_PAGE_SIZE,
    ...(isDescending !== undefined ? { isDescending } : {}),
    ...(statusFilter !== "" ? { status: statusFilter } : {}),
    assignedToMe: true,
  });

  const rows = flattenInfinitePages(q.data?.pages);

  const filteredRows = useMemo(() => {
    const qNorm = debouncedSearch.toLowerCase();
    if (!qNorm) return rows;
    return rows.filter((b) => {
      const hay = `${b.itemsSummary ?? ""} ${b.branchName ?? ""}`.toLowerCase();
      return hay.includes(qNorm);
    });
  }, [rows, debouncedSearch]);

  const isInitialLoading = q.isLoading && !q.data;
  const isEmpty = !isInitialLoading && !q.isError && rows.length === 0;
  const isSearchEmpty = !isInitialLoading && !q.isError && rows.length > 0 && filteredRows.length === 0;

  return (
    <div className="space-y-5">
      <BookingRequireDialog
        branchId={branchId}
        open={detailBookingId !== null}
        onOpenChange={(o) => {
          if (!o) setDetailBookingId(null);
        }}
        bookingId={detailBookingId}
      />

      <div className="space-y-0">
        <RequireBookingToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onRefresh={() => void q.refetch()}
          isRefreshing={q.isFetching && !q.isFetchingNextPage}
        />
        <div className="pt-4">
          {q.isError ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-5 text-sm shadow-sm">
              <p className="text-destructive">{q.error instanceof Error ? q.error.message : "Không tải được danh sách."}</p>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void q.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : isInitialLoading ? (
            <RequiresBookingsSkeleton />
          ) : isEmpty ? (
            <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">Chưa có lịch hẹn nào.</p>
            </div>
          ) : isSearchEmpty ? (
            <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">Không có lịch hẹn khớp tìm kiếm hoặc bộ lọc.</p>
            </div>
          ) : (
            <div
              className={cn(
                "max-h-[min(70vh,40rem)] overflow-y-auto overscroll-contain rounded-xl p-3 sm:p-4",
                "[-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5",
              )}
              onScroll={q.onScrollToLoadMore}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRows.map((booking) => (
                  <RequiresBookingCard key={booking.id} booking={booking} onOpenDetail={() => setDetailBookingId(booking.id)} />
                ))}
              </div>

              <div className="flex min-h-10 items-center justify-center py-3">
                {q.isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Đang tải thêm…
                  </span>
                ) : q.hasNextPage ? (
                  <span className="text-xs text-muted-foreground/80">Cuộn xuống để tải thêm</span>
                ) : (
                  <span className="text-xs text-muted-foreground/70">Đã hiển thị hết</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
