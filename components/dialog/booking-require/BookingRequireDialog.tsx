"use client";

import { useState } from "react";
import { Clock, Loader2, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  bookingLineDescription,
  bookingLineEstimatedMinutes,
  bookingLineKindLabel,
  bookingLineReferencePrice,
  bookingLineThumbnailUrl,
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

function lineKindBadgeClass(kind: string): string {
  if (kind === "Combo") return "border-violet-500/35 bg-violet-500/10 text-violet-800 dark:text-violet-200";
  if (kind === "Phụ tùng") return "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100";
  if (kind === "Dịch vụ") return "border-sky-500/35 bg-sky-500/10 text-sky-900 dark:text-sky-100";
  return "border-border/60 bg-muted/60 text-foreground";
}

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

              <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
                <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm lg:h-full">
                  <h3 className="text-xs font-semibold text-foreground">Xe</h3>
                  <div className="mt-3 flex min-h-0 flex-1 flex-col space-y-4">
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

                <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm lg:h-full">
                  <div className="flex shrink-0 items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Dòng đặt chỗ</h3>
                    {q.data.lineItems.length > 0 ? (
                      <Badge variant="secondary" className="h-6 px-2 text-[10px] font-medium tabular-nums">
                        {q.data.lineItems.length} mục
                      </Badge>
                    ) : null}
                  </div>
                  {q.data.lineItems.length === 0 ? (
                    <p className="mt-3 flex flex-1 items-center text-sm text-muted-foreground">Chưa có dòng nào.</p>
                  ) : (
                    <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] pr-0.5">
                      <ul className="flex flex-col gap-3">
                        {[...q.data.lineItems]
                          .sort((a, b) => a.line.sortOrder - b.line.sortOrder)
                          .map(({ line, title }) => {
                            const thumb = bookingLineThumbnailUrl(line);
                            const desc = bookingLineDescription(line);
                            const estMin = bookingLineEstimatedMinutes(line);
                            const refPrice = bookingLineReferencePrice(line);
                            const kind = bookingLineKindLabel(line);
                            const booked = formatBookingRequireMoney(line.bookedItemAmount, line.bookedItemCurrency);
                            return (
                              <li key={line.id}>
                                <article
                                  className={cn(
                                    "overflow-hidden rounded-2xl border border-border/70 bg-linear-to-b from-card to-muted/15 shadow-sm ring-1 ring-black/4 dark:ring-white/6",
                                    "transition-[box-shadow,transform] duration-200 hover:shadow-md",
                                  )}
                                >
                                  <div className="flex flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4">
                                    {thumb ? (
                                      <div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-muted/40 shadow-inner sm:mx-0 sm:h-18 sm:w-18">
                                        <SafeImage src={thumb} alt="" fill className="object-cover" />
                                      </div>
                                    ) : (
                                      <div
                                        className="mx-auto grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-dashed border-border/60 bg-muted/30 text-muted-foreground sm:mx-0 sm:h-18 sm:w-18"
                                        aria-hidden
                                      >
                                        <Package className="size-7 opacity-50" />
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1 space-y-2.5">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                        <div className="min-w-0 flex-1 space-y-2">
                                          <h4 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                                            {title}
                                          </h4>
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "h-6 border px-2 text-[10px] font-semibold uppercase tracking-wider",
                                                lineKindBadgeClass(kind),
                                              )}
                                            >
                                              {kind}
                                            </Badge>
                                            {line.includeInstallation ? (
                                              <Badge variant="outline" className="h-6 border-primary/30 bg-primary/8 px-2 text-[10px] font-medium text-primary">
                                                Lắp đặt
                                              </Badge>
                                            ) : null}
                                          </div>
                                        </div>
                                        <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2 text-right sm:min-w-30">
                                          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Thành tiền
                                          </p>
                                          <p className="mt-0.5 text-base font-bold tabular-nums leading-none tracking-tight text-foreground">
                                            {booked}
                                          </p>
                                        </div>
                                      </div>

                                      {(estMin != null || refPrice) && (
                                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/50 pt-2.5 text-xs">
                                          {estMin != null ? (
                                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                              <Clock className="size-3.5 shrink-0 opacity-70" aria-hidden />
                                              <span>Ước tính ~{estMin} phút</span>
                                            </span>
                                          ) : null}
                                          {refPrice ? (
                                            <span className="text-muted-foreground">
                                              <span className="font-medium text-foreground/80">{refPrice.label}:</span>{" "}
                                              <span className="tabular-nums font-semibold text-foreground">{refPrice.formatted}</span>
                                            </span>
                                          ) : null}
                                        </div>
                                      )}

                                      {desc ? (
                                        <p className="line-clamp-4 rounded-lg border border-border/40 bg-muted/35 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                          {desc}
                                        </p>
                                      ) : null}

                                      {line.bundleDetails ? (
                                        <div className="space-y-2 rounded-xl border border-dashed border-primary/25 bg-primary/6 p-3 dark:bg-primary/9">
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/90">
                                            Chi tiết combo
                                          </p>
                                          {line.bundleDetails.name?.trim() && line.bundleDetails.name.trim() !== title.trim() ? (
                                            <p className="text-sm font-medium text-foreground">{line.bundleDetails.name.trim()}</p>
                                          ) : null}
                                          {(line.bundleDetails.discountPercent != null ||
                                            line.bundleDetails.discountAmount != null) && (
                                            <p className="text-xs text-muted-foreground">
                                              <span className="font-medium text-foreground/90">Giảm giá:</span>{" "}
                                              {line.bundleDetails.discountPercent != null
                                                ? `${line.bundleDetails.discountPercent}%`
                                                : null}
                                              {line.bundleDetails.discountPercent != null &&
                                              line.bundleDetails.discountAmount != null
                                                ? " · "
                                                : null}
                                              {line.bundleDetails.discountAmount != null
                                                ? formatBookingRequireMoney(line.bundleDetails.discountAmount)
                                                : null}
                                            </p>
                                          )}
                                          {line.bundleDetails.items?.length ? (
                                            <ul className="space-y-2 border-t border-border/40 pt-2">
                                              {line.bundleDetails.items.map((bi, i) => (
                                                <li key={i} className="flex gap-2.5 text-xs leading-snug text-muted-foreground">
                                                  <span
                                                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50"
                                                    aria-hidden
                                                  />
                                                  <span className="min-w-0 flex-1">{formatBundleDetailItemLabel(bi)}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : null}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </article>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
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
