"use client";

import { Loader2 } from "lucide-react";

import { BookingDetailBody } from "@/components/booking/booking-detail-body";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingDetailEnrichedQuery } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

export type BookingDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  garageId?: string;
  branchId?: string;
  onRequestAssign?: () => void;
};

export function BookingDetailDialog({
  open,
  onOpenChange,
  bookingId,
  garageId,
  branchId,
  onRequestAssign,
}: BookingDetailDialogProps) {
  const enabled = open && Boolean(bookingId);
  const q = useBookingDetailEnrichedQuery(bookingId ?? undefined, enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(90dvh,100svh)] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)] flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-xl",
          "sm:max-h-[min(92vh,900px)] sm:w-full sm:max-w-[min(56rem,calc(100vw-1.5rem))] sm:rounded-2xl",
        )}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b border-border/60 px-3 pb-2.5 pt-3 sm:px-6 sm:pb-3 sm:pt-4">
          <DialogTitle className="pr-10 text-left text-base font-semibold leading-snug sm:pr-8 sm:text-lg">
            Chi tiết lịch hẹn
          </DialogTitle>
          <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
            Khách, xe, dòng đặt chỗ và lịch sử trạng thái.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 sm:py-4">
          {q.isPending ? (
            <div className="space-y-2.5 sm:space-y-3">
              <Skeleton className="h-7 w-2/3 max-w-xs sm:h-8 sm:max-w-sm" />
              <Skeleton className="h-20 w-full rounded-lg sm:h-24" />
              <Skeleton className="h-28 w-full rounded-lg sm:h-32" />
            </div>
          ) : q.isError ? (
            <div className="rounded-lg border border-destructive/25 bg-destructive/6 p-3 text-xs text-destructive sm:rounded-xl sm:p-4 sm:text-sm">
              {q.error?.message ?? "Không tải được chi tiết."}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-8 text-xs sm:mt-3 sm:h-9 sm:text-sm"
                onClick={() => void q.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : q.data ? (
            <BookingDetailBody
              data={q.data}
              garageId={garageId}
              branchId={branchId}
              onRequestAssign={onRequestAssign}
            />
          ) : null}
        </div>

        {q.isFetching && !q.isPending ? (
          <div className="flex items-center gap-2 border-t border-border/60 px-3 py-1.5 text-[10px] text-muted-foreground sm:px-6 sm:py-2 sm:text-xs">
            <Loader2 className="size-3 animate-spin sm:size-3.5" aria-hidden />
            Đang làm mới…
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
