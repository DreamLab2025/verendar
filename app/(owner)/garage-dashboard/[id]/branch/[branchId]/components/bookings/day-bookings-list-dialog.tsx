"use client";

import { Eye, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogSheetHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { flattenInfinitePages, useBranchBookingsInfiniteScroll } from "@/hooks/useBookings";
import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

import { canAssignBookingMechanic } from "./assign-mechanic-dialog";
import {
  BookingStatusBadge,
  formatTimeOnly,
  formatVnd,
  localDateKeyFromIso,
} from "./bookings-shared";

function formatDayTitle(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d, 12, 0, 0, 0));
}

export type DayBookingsListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  /** YYYY-MM-DD */
  dateKey: string | null;
  /** Đã có từ lịch — hiển thị ngay; infinite query đồng bộ / bổ sung. */
  prefetchedBookings: BookingListItemDto[];
  onOpenDetail: (bookingId: string) => void;
  onOpenAssign: (bookingId: string) => void;
};

export function DayBookingsListDialog({
  open,
  onOpenChange,
  branchId,
  dateKey,
  prefetchedBookings,
  onOpenDetail,
  onOpenAssign,
}: DayBookingsListDialogProps) {
  const inf = useBranchBookingsInfiniteScroll(branchId || undefined, {
    enabled: open && Boolean(branchId) && Boolean(dateKey),
    pageSize: 50,
    isDescending: false,
  });

  const flat = useMemo(() => flattenInfinitePages(inf.data?.pages), [inf.data?.pages]);

  /** Gộp prefetched + dữ liệu infinite (theo id) rồi lọc đúng ngày. */
  const rows = useMemo(() => {
    if (!dateKey) return [];
    const merged = new Map<string, BookingListItemDto>();
    for (const b of prefetchedBookings) merged.set(b.id, b);
    for (const b of flat) merged.set(b.id, b);
    return [...merged.values()]
      .filter((b) => localDateKeyFromIso(b.scheduledAt) === dateKey)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [dateKey, prefetchedBookings, flat]);

  /** Tải nối các trang khi mở dialog để đủ dữ liệu lọc theo ngày (API không lọc theo ngày). */
  useEffect(() => {
    if (!open || !branchId || !dateKey) return;
    if (inf.hasNextPage && !inf.isFetchingNextPage) {
      void inf.fetchNextPage();
    }
  }, [open, branchId, dateKey, inf.hasNextPage, inf.isFetchingNextPage, inf.fetchNextPage, inf.data?.pages]);

  const loadingMore = inf.isFetchingNextPage || inf.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="bottomSheet"
        open={open}
        onOpenChange={onOpenChange}
        showCloseButton={false}
        className={cn(
          "flex max-h-[min(92dvh,100svh)] w-full flex-col gap-0 overflow-hidden p-0",
          "md:max-h-[min(85vh,720px)] md:max-w-lg md:rounded-lg",
        )}
      >
        <DialogSheetHeader className="shrink-0 sm:px-5">
          <DialogTitle className="text-left text-base font-semibold sm:text-lg">
            {dateKey ? formatDayTitle(dateKey) : "Lịch hẹn trong ngày"}
          </DialogTitle>
          <DialogDescription className="text-left text-xs text-muted-foreground sm:text-sm">
            {rows.length} lịch hẹn
            {loadingMore && inf.hasNextPage ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Đang tải thêm
              </span>
            ) : null}
          </DialogDescription>
        </DialogSheetHeader>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
          onScroll={inf.onScrollToLoadMore}
        >
          {rows.length === 0 && loadingMore ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Đang tải danh sách…
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Không có lịch hẹn trong ngày này.</p>
          ) : (
            <ul className="space-y-2.5">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-border/50 bg-muted/15 p-3 shadow-sm transition-colors hover:bg-muted/25"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tabular-nums text-foreground">{formatTimeOnly(row.scheduledAt)}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.itemsSummary?.trim() || "—"}</p>
                    </div>
                    <BookingStatusBadge status={row.status} compact />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2">
                    <span className="text-sm font-semibold tabular-nums text-foreground">{formatVnd(row.bookedTotalAmount)}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => onOpenDetail(row.id)}
                      >
                        <Eye className="size-3.5" aria-hidden />
                        Chi tiết
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        disabled={!canAssignBookingMechanic(row.status)}
                        onClick={() => onOpenAssign(row.id)}
                      >
                        Gán
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {inf.hasNextPage && !inf.isFetchingNextPage && rows.length > 0 ? (
            <div className="pb-2 pt-4 text-center">
              <Button type="button" variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => void inf.fetchNextPage()}>
                Tải thêm
              </Button>
            </div>
          ) : null}

          {inf.isFetchingNextPage ? (
            <div className="flex justify-center py-3">
              <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
