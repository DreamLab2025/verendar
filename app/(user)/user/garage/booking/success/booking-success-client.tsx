"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { ArrowLeft, Building2, CheckCircle2, Clock } from "lucide-react";

import {
  bookingStatusLabelVi,
  formatBookingRequireStatusHistoryTime,
} from "@/components/helper/booking-require";
import { BookingRequireStepper } from "@/components/dialog/booking-require/BookingRequireStepper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BookingDetailDto, BookingLineItemDto } from "@/lib/api/services/fetchBooking";
import { readCreatedBookingResponse } from "@/lib/booking/booking-success-storage";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

function formatVnd(amount: number | null | undefined, currency?: string | null): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  const cur = (currency || "VND").toUpperCase();
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: cur === "VND" ? "VND" : cur,
      maximumFractionDigits: cur === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${cur}`;
  }
}

function lineKindLabel(line: BookingLineItemDto): string {
  const base = line.productId ? "Phụ tùng" : line.serviceId ? "Dịch vụ" : "Combo";
  if (line.productId && line.includeInstallation) return `${base} · lắp đặt`;
  return base;
}

function LineRow({ line, compact }: { line: BookingLineItemDto; compact?: boolean }) {
  return (
    <li
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1 border-b border-border/40 py-3 last:border-b-0 sm:gap-x-4 sm:py-3.5",
        compact && "py-2.5 sm:py-3",
      )}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <p
          className={cn(
            "wrap-break-word font-medium leading-snug text-foreground",
            compact ? "text-[13px] sm:text-sm" : "text-[15px]",
          )}
        >
          {line.itemName}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{lineKindLabel(line)}</p>
        {line.bundleDetails?.items?.length ? (
          <ul className="mt-2 max-w-full space-y-0.5 border-l-2 border-primary/20 pl-3 text-[11px] text-muted-foreground">
            {line.bundleDetails.items.map((bi, i) => (
              <li key={`${bi.itemName}-${i}`} className="wrap-break-word">
                {bi.itemName}
                {bi.includeInstallation ? " · lắp đặt" : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <span className="shrink-0 tabular-nums text-[13px] font-semibold text-foreground sm:text-sm">
        {formatVnd(line.bookedItemAmount, line.bookedItemCurrency)}
      </span>
    </li>
  );
}

function FieldBlock({ kicker, children, className }: { kicker: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[10px] sm:tracking-[0.12em]">
        {kicker}
      </p>
      <div className="mt-1.5 text-[13px] leading-snug text-foreground sm:mt-2 sm:text-sm sm:leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function BookingSuccessShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 w-full min-w-0 max-w-[100vw] overflow-x-hidden bg-linear-to-b from-muted/45 to-background pb-[max(3rem,env(safe-area-inset-bottom))] pt-3 dark:from-muted/20 sm:pb-16 sm:pt-6">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function BookingSuccessClient() {
  const [hydrated, setHydrated] = useState(false);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  /* eslint-disable react-hooks/set-state-in-effect -- cờ post-mount để đồng bộ SSR/hydration với searchParams + sessionStorage */
  useEffect(() => {
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const payload = useMemo(() => {
    if (!bookingId) return null;
    return readCreatedBookingResponse(bookingId);
  }, [bookingId]);

  const data: BookingDetailDto | null | undefined = payload?.data ?? undefined;

  /** Tránh hydration mismatch: `useSearchParams` / sessionStorage khác SSR vs client. */
  if (!hydrated) {
    return (
      <BookingSuccessShell>
        <p className="py-16 text-center text-sm text-muted-foreground">Đang tải…</p>
      </BookingSuccessShell>
    );
  }

  if (!bookingId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Thiếu mã đặt lịch.</p>
        <Button asChild className="mt-6 h-11 w-full max-w-xs rounded-xl" variant="default">
          <Link href="/user/garage">Về garage</Link>
        </Button>
      </div>
    );
  }

  if (!payload || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Không tải được chi tiết (tab mới hoặc dữ liệu phiên đã hết hạn). Mã tham chiếu:
        </p>
        <Button asChild className="mt-8 h-11 w-full max-w-xs rounded-xl" variant="default">
          <Link href="/user/garage">Về garage</Link>
        </Button>
      </div>
    );
  }

  const scheduled = dayjs(data.scheduledAt);
  const statusLabel = (data.status ?? "—").toString().toUpperCase();
  const sortedLines = (data.lineItems ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);

  const successFootnote = payload.message?.trim()
    ? payload.message.trim()
    : payload.isSuccess
      ? "Đặt lịch thành công."
      : null;

  return (
    <BookingSuccessShell>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-1 mb-3 h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground sm:-ml-2 sm:mb-5 sm:h-9 sm:text-sm"
          asChild
        >
          <Link href="/user/garage">
            <ArrowLeft className="size-3.5 sm:size-4" aria-hidden />
            Garage
          </Link>
        </Button>

        <article className="max-w-full min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm sm:rounded-2xl sm:shadow-[0_1px_0_rgba(0,0,0,0.04),0_16px_40px_-18px_rgba(0,0,0,0.14)] dark:border-border/50 dark:sm:shadow-[0_1px_0_rgba(255,255,255,0.04),0_20px_50px_-20px_rgba(0,0,0,0.5)]">
          {/* Header ngang: icon + copy | mã + trạng thái */}
          <div className="relative border-b border-emerald-600/10 bg-emerald-500/[0.07] dark:border-emerald-500/15 dark:bg-emerald-500/9">
            <div
              className="absolute inset-y-0 left-0 w-0.5 bg-emerald-600/70 sm:w-1 dark:bg-emerald-500/80"
              aria-hidden
            />
            <div className="flex min-w-0 flex-col gap-3 p-4 pl-4.5 sm:gap-5 sm:p-6 sm:pl-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:p-7">
              <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/12 text-emerald-700 sm:size-12 dark:bg-emerald-400/15 dark:text-emerald-300">
                  <CheckCircle2 className="size-5 stroke-[1.75] sm:size-6" aria-hidden />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg md:text-xl">
                    Đã gửi yêu cầu đặt lịch
                  </h1>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
                    Garage sẽ xem xét và phản hồi sớm. Bạn không cần thanh toán trước ở bước này.
                  </p>
                  {successFootnote ? (
                    <p className="mt-2 text-[11px] font-medium text-emerald-800/90 dark:text-emerald-200/90 sm:mt-2.5 sm:text-xs">
                      {successFootnote}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex w-full min-w-0 flex-wrap items-center gap-2 pl-13 sm:w-auto sm:pl-0 lg:flex-col lg:items-end lg:gap-2">
                <span className="rounded-full border border-emerald-800/15 bg-white/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-900/80 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-100">
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Thân: trái thông tin | phải biên lai */}
          <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-5 overflow-hidden border-border/60 p-4 sm:space-y-8 sm:p-6 lg:border-r lg:p-8">
              <BookingRequireStepper
                serverStatus={data.status ?? ""}
                layoutId="booking-success-progress-pill"
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:gap-x-12">
                <FieldBlock kicker="Lịch hẹn">
                  <div className="flex min-w-0 gap-2 sm:gap-2.5">
                    <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground sm:size-4" aria-hidden />
                    <p className="min-w-0 wrap-break-word font-medium capitalize">
                      {scheduled.isValid() ? scheduled.format("dddd, D MMMM YYYY · HH:mm") : data.scheduledAt}
                    </p>
                  </div>
                </FieldBlock>
                <FieldBlock kicker="Chi nhánh">
                  <div className="flex min-w-0 gap-2 sm:gap-2.5">
                    <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground sm:size-4" aria-hidden />
                    <div className="min-w-0">
                      <p className="wrap-break-word font-medium">{data.branch?.name ?? "—"}</p>
                      {data.branch?.addressLine ? (
                        <p className="mt-1 wrap-break-word text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                          {data.branch.addressLine}
                        </p>
                      ) : null}
                      {data.branch?.garageBusinessName ? (
                        <p className="mt-1 text-[11px] text-muted-foreground/90 sm:mt-1.5 sm:text-xs">
                          {data.branch.garageBusinessName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </FieldBlock>
              </div>

              {data.note ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-3 dark:bg-muted/10 sm:rounded-xl sm:px-5 sm:py-3.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[10px] sm:tracking-[0.12em]">
                    Ghi chú
                  </p>
                  <p className="mt-1.5 max-w-full whitespace-pre-wrap wrap-break-word text-[13px] leading-relaxed text-foreground sm:mt-2 sm:text-sm">
                    {data.note}
                  </p>
                </div>
              ) : null}

              <Separator className="bg-border/55" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:gap-x-12">
                <FieldBlock kicker="Khách">
                  <p className="wrap-break-word font-medium">{data.customer?.fullName ?? "—"}</p>
                  {data.customer?.phoneNumber ? (
                    <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
                      {data.customer.phoneNumber}
                    </p>
                  ) : null}
                  {data.customer?.email ? (
                    <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
                      {data.customer.email}
                    </p>
                  ) : null}
                </FieldBlock>
                <FieldBlock kicker="Xe">
                  <p className="wrap-break-word font-medium tabular-nums">{data.vehicle?.licensePlate ?? "—"}</p>
                  <p className="mt-1 wrap-break-word text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
                    {[data.vehicle?.brandName, data.vehicle?.modelName].filter(Boolean).join(" ") || "—"}
                  </p>
                  {data.vehicle?.variantColor ? (
                    <p className="mt-1 text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
                      Màu {data.vehicle.variantColor}
                    </p>
                  ) : null}
                </FieldBlock>
              </div>

              {data.statusHistory?.length ? (
                <>
                  <Separator className="bg-border/55" />
                  <div>
                    <h2 className="text-[13px] font-semibold tracking-tight text-foreground sm:text-sm">
                      Lịch sử trạng thái
                    </h2>
                    <ul className="relative mt-4">
                      {/* Đường dọc xuyên tâm cột chấm — cùng pattern BookingRequireDialog */}
                      <div
                        className="pointer-events-none absolute bottom-3 left-3 top-3 w-px -translate-x-1/2 bg-border"
                        aria-hidden
                      />
                      {[...data.statusHistory]
                        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
                        .map((h, index) => {
                          const isLatest = index === 0;
                          return (
                            <li key={h.id} className="relative flex gap-3 pb-7 last:pb-0">
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
                                  {bookingStatusLabelVi(h.toStatus)}
                                </p>
                                <time
                                  className={cn("mt-0.5 block text-xs", !isLatest && "text-muted-foreground/90")}
                                  dateTime={h.changedAt}
                                >
                                  {formatBookingRequireStatusHistoryTime(h.changedAt)}
                                </time>
                                {h.note ? (
                                  <p className="mt-1 text-xs italic text-muted-foreground/90">{h.note}</p>
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>

            {/* Cột phải: tóm tắt đơn — sticky trên desktop */}
            <aside className="min-w-0 overflow-hidden border-t border-border/60 bg-muted/20 p-4 sm:p-6 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:border-t-0 lg:p-8 dark:bg-muted/10 [scrollbar-width:thin]">
              <div className="flex min-w-0 items-end justify-between gap-2 border-b border-border/50 pb-3 sm:gap-3 sm:pb-4">
                <h2 className="min-w-0 flex-1 wrap-break-word text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
                  Dịch vụ đã đặt
                </h2>
                <p className="shrink-0 text-right text-base font-bold tabular-nums text-foreground sm:text-lg">
                  {formatVnd(data.bookedTotalAmount, data.bookedCurrency)}
                </p>
              </div>
              <ul className="mt-0.5 min-w-0 sm:mt-1">
                {sortedLines.map((line) => (
                  <LineRow key={line.id} line={line} compact />
                ))}
              </ul>

              <div className="mt-6 hidden lg:block">
                <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" size="lg">
                  <Link href="/user/garage">Về trang garage</Link>
                </Button>
              </div>
            </aside>
          </div>

          <div className="border-t border-border/60 bg-muted/25 px-4 py-3 dark:bg-muted/15 sm:px-6 sm:py-4 lg:hidden">
            <Button
              asChild
              className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm sm:h-12 sm:text-base"
              size="lg"
            >
              <Link href="/user/garage">Về trang garage</Link>
            </Button>
          </div>
        </article>
    </BookingSuccessShell>
  );
}
