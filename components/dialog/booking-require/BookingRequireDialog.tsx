"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  bookingStatusLabelVi,
  formatBookingRequireMoney,
  formatBookingRequireStatusHistoryTime,
  formatBundleDetailItemLabel,
} from "@/components/helper/booking-require";
import { LicensePlateBadge } from "@/components/shared/LicensePlateBadge";
import { BookingRequireStepper } from "./BookingRequireStepper";
import { BookingRequireStatusDialog } from "./BookingRequireStatusDialog";
import { useBookingDetailEnrichedQuery } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

function isRadixSelectPortalTarget(node: EventTarget | null): boolean {
  if (!(node instanceof Element)) return false;
  return Boolean(
    node.closest("[data-radix-select-viewport]") ||
      node.closest('[role="listbox"]') ||
      node.closest("[data-radix-popper-content-wrapper]"),
  );
}

export type BookingRequireDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  /** Chi nhánh — invalidate danh sách sau PATCH status (optional nếu chỉ dùng assigned-to-me). */
  branchId?: string;
};

export function BookingRequireDialog({ open, onOpenChange, bookingId, branchId }: BookingRequireDialogProps) {
  const enabled = open && Boolean(bookingId);
  const q = useBookingDetailEnrichedQuery(bookingId ?? undefined, enabled);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleMainOpenChange = (next: boolean) => {
    if (!next) {
      setStatusDialogOpen(false);
    }
    onOpenChange(next);
  };

  const canShowStatusAction =
    q.data != null && q.data.raw.status !== "Cancelled" && q.data.raw.status !== "Completed";

  return (
    <Dialog open={open} onOpenChange={handleMainOpenChange}>
      <DialogContent
        showCloseButton
        onPointerDownOutside={(e) => {
          if (isRadixSelectPortalTarget(e.target)) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isRadixSelectPortalTarget(e.target)) e.preventDefault();
        }}
        className={cn(
          "booking-require-dialog flex max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-xl",
          "left-0 top-0 h-dvh max-h-dvh sm:left-[50%] sm:top-[50%] sm:h-[min(96dvh,900px)] sm:max-h-[min(96dvh,900px)] sm:w-[min(1200px,calc(100vw-1rem))] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <DialogTitle className="pr-10 text-left text-base font-semibold sm:text-lg">Chi tiết yêu cầu / lịch hẹn</DialogTitle>
          <DialogDescription className="text-left text-xs text-muted-foreground sm:text-sm">
            Tiến trình, xe, dòng đặt chỗ và lịch sử trạng thái.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {q.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          ) : q.isError ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/6 p-4 text-sm text-destructive">
              {q.error?.message ?? "Không tải được chi tiết."}
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void q.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : q.data ? (
            <div className="space-y-6">
              <section className="space-y-3">
                <BookingRequireStepper serverStatus={q.data.raw.status} />
                {canShowStatusAction ? (
                  <div className="flex justify-end">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setStatusDialogOpen(true)}>
                      Xử lý trạng thái
                    </Button>
                  </div>
                ) : null}
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                <section className="min-w-0 rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm">
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-center">
                      <LicensePlateBadge
                        licensePlate={q.data.vehicle.licensePlate || "—"}
                        className="shadow-[0_4px_14px_rgba(0,0,0,0.14)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
                      />
                    </div>
                    {q.data.vehicle.imageUrl ? (
                      <div className="flex justify-center px-1">
                        <SafeImage
                          src={q.data.vehicle.imageUrl}
                          alt={`${q.data.vehicle.brand} ${q.data.vehicle.model}`}
                          width={640}
                          height={480}
                          className="h-auto max-h-56 w-full max-w-md object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                    ) : null}
                    <dl className="space-y-2 border-t border-border/60 pt-4 text-sm">
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                        <dt className="text-muted-foreground">Hãng</dt>
                        <dd className="text-right font-medium">{q.data.vehicle.brand}</dd>
                      </div>
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                        <dt className="text-muted-foreground">Dòng xe</dt>
                        <dd className="text-right font-medium">{q.data.vehicle.model}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section className="min-w-0 rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-foreground">Dòng đặt chỗ</h3>
                  {q.data.lineItems.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Chưa có dòng nào.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-border/80">
                      {[...q.data.lineItems]
                        .sort((a, b) => a.line.sortOrder - b.line.sortOrder)
                        .map(({ line, title }) => (
                          <li key={line.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium leading-snug text-foreground">{title}</p>
                              {line.bundleDetails ? (
                                <div className="mt-2 space-y-1.5 rounded-lg border border-border/50 bg-muted/25 px-2.5 py-2">
                                  {line.bundleDetails.name?.trim() && line.bundleDetails.name.trim() !== title.trim() ? (
                                    <p className="text-[11px] font-medium text-foreground/90">{line.bundleDetails.name.trim()}</p>
                                  ) : null}
                                  {(line.bundleDetails.discountPercent != null || line.bundleDetails.discountAmount != null) && (
                                    <p className="text-[11px] text-muted-foreground">
                                      Giảm{" "}
                                      {line.bundleDetails.discountPercent != null ? `${line.bundleDetails.discountPercent}%` : null}
                                      {line.bundleDetails.discountPercent != null && line.bundleDetails.discountAmount != null
                                        ? " · "
                                        : null}
                                      {line.bundleDetails.discountAmount != null
                                        ? formatBookingRequireMoney(line.bundleDetails.discountAmount)
                                        : null}
                                    </p>
                                  )}
                                  {line.bundleDetails.items?.length ? (
                                    <ul className="list-inside list-disc text-[11px] leading-relaxed text-muted-foreground">
                                      {line.bundleDetails.items.map((bi, i) => (
                                        <li key={i}>{formatBundleDetailItemLabel(bi)}</li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
                              ) : null}
                              {line.includeInstallation ? (
                                <p className="mt-0.5 text-[11px] text-muted-foreground">Kèm lắp đặt</p>
                              ) : null}
                            </div>
                            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                              {formatBookingRequireMoney(line.bookedItemAmount, line.bookedItemCurrency)}
                            </p>
                          </li>
                        ))}
                    </ul>
                  )}
                </section>
              </div>

              <section className="rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-foreground">Lịch sử trạng thái</h3>
                {q.data.historyEntries.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Chưa có lịch sử thay đổi trạng thái.</p>
                ) : (
                  <ul className="relative mt-4">
                    {/* Đường dọc xuyên tâm cột chấm */}
                    <div
                      className="pointer-events-none absolute bottom-3 left-3 top-3 w-px -translate-x-1/2 bg-border"
                      aria-hidden
                    />
                    {[...q.data.historyEntries]
                      .sort((a, b) => new Date(b.entry.changedAt).getTime() - new Date(a.entry.changedAt).getTime())
                      .map(({ entry }, index) => {
                        const isLatest = index === 0;
                        return (
                          <li key={entry.id} className="relative flex gap-3 pb-7 last:pb-0">
                            <div className="relative z-10 flex w-6 shrink-0 justify-center pt-0.5">
                              {isLatest ? (
                                <span className="relative flex size-3.5 items-center justify-center">
                                  <span
                                    className="absolute inline-flex size-4 animate-ping rounded-full bg-primary/45 opacity-60 motion-reduce:animate-none"
                                    aria-hidden
                                  />
                                  <span className="relative size-3 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--background))]" />
                                </span>
                              ) : (
                                <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/35 shadow-[0_0_0_3px_hsl(var(--background))]" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "min-w-0 flex-1 pt-0",
                                !isLatest && "text-muted-foreground",
                              )}
                            >
                              <p
                                className={cn(
                                  "text-sm font-medium leading-snug",
                                  isLatest ? "text-foreground" : "text-muted-foreground",
                                )}
                              >
                                {bookingStatusLabelVi(entry.toStatus)}
                              </p>
                              <p className={cn("mt-0.5 text-xs", !isLatest && "text-muted-foreground/90")}>
                                {formatBookingRequireStatusHistoryTime(entry.changedAt)}
                              </p>
                              {entry.note ? (
                                <p className="mt-1 text-xs italic text-muted-foreground/90">{entry.note}</p>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </section>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Đang tải…
            </div>
          )}
        </div>

        <BookingRequireStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          bookingId={bookingId}
          branchId={branchId}
        />
      </DialogContent>
    </Dialog>
  );
}
