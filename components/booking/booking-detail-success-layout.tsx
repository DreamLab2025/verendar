"use client";

import type { ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Building2, CalendarClock, CheckCircle2, Clock } from "lucide-react";

import {
  bookingStatusLabelVi,
  formatBookingRequireStatusHistoryTime,
} from "@/components/helper/booking-require";
import { BookingRequireStepper } from "@/components/dialog/booking-require/BookingRequireStepper";
import { Separator } from "@/components/ui/separator";
import type { BookingLineItemDto } from "@/lib/api/services/fetchBooking";
import type { EnrichedBookingDetail } from "@/lib/booking/enrich-booking-detail";
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

function lineEmbeddedImageUrl(line: BookingLineItemDto): string | undefined {
  const u = line.productDetails?.imageUrl?.trim() || line.serviceDetails?.imageUrl?.trim();
  return u || undefined;
}

function lineEmbeddedDescription(line: BookingLineItemDto): string | undefined {
  const d = line.productDetails?.description?.trim() || line.serviceDetails?.description?.trim();
  return d || undefined;
}

function lineEstimatedMinutes(line: BookingLineItemDto): number | undefined {
  const n = line.productDetails?.estimatedDurationMinutes ?? line.serviceDetails?.estimatedDurationMinutes;
  return typeof n === "number" && !Number.isNaN(n) ? n : undefined;
}

function LineRow({ line, compact }: { line: BookingLineItemDto; compact?: boolean }) {
  const imgUrl = lineEmbeddedImageUrl(line);
  const desc = lineEmbeddedDescription(line);
  const estMin = lineEstimatedMinutes(line);

  return (
    <li
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1 border-b border-border/40 py-3 last:border-b-0 sm:gap-x-4 sm:py-3.5",
        compact && "py-2.5 sm:py-3",
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt=""
            className="size-12 shrink-0 rounded-lg border border-border/50 bg-muted/30 object-cover sm:size-14"
            loading="lazy"
          />
        ) : null}
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
          {estMin != null ? (
            <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">Ước tính ~{estMin} phút</p>
          ) : null}
          {desc ? (
            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{desc}</p>
          ) : null}
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

export type BookingDetailSuccessLayoutProps = {
  data: EnrichedBookingDetail;
  /** success = copy trang đặt lịch thành công; detail = chi tiết lịch (lịch sử / dialog) */
  variant?: "success" | "detail";
  /** Dòng phụ dưới subtitle (vd. footnote trang success) */
  headerExtra?: ReactNode;
  /** Nội dung cuối cột phải (vd. nút desktop) */
  asideFooter?: ReactNode;
  /** Nội dung dưới lưới 2 cột, trong article (vd. thanh CTA mobile) */
  articleBottom?: ReactNode;
  /** Bước tiến trình — id khác nhau để tránh xung đột layout animation */
  stepperLayoutId?: string;
  /** Ẩn band header xanh (title + badge) — dùng trong dialog để tránh trùng với chrome dialog */
  showHeader?: boolean;
  className?: string;
};

/**
 * Bố cục chi tiết booking giống {@link app/(user)/user/garage/booking/success/booking-success-client.tsx}
 * (header ngang + 2 cột + cột phải tóm tắt đơn).
 */
export function BookingDetailSuccessLayout({
  data: q,
  variant = "detail",
  headerExtra,
  asideFooter,
  articleBottom,
  stepperLayoutId = "booking-detail-progress-pill",
  showHeader = true,
  className,
}: BookingDetailSuccessLayoutProps) {
  const raw = q.raw;
  const scheduled = dayjs(raw.scheduledAt);
  const sortedLines = (q.lineItems ?? [])
    .slice()
    .sort((a, b) => a.line.sortOrder - b.line.sortOrder)
    .map(({ line, title }) => ({ ...line, itemName: title || line.itemName }));

  const isSuccess = variant === "success";

  return (
    <article
      className={cn(
        "max-w-full min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm sm:rounded-2xl sm:shadow-[0_1px_0_rgba(0,0,0,0.04),0_16px_40px_-18px_rgba(0,0,0,0.14)] dark:border-border/50 dark:sm:shadow-[0_1px_0_rgba(255,255,255,0.04),0_20px_50px_-20px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {showHeader ? (
        <div className="relative border-b border-emerald-600/10 bg-emerald-500/[0.07] dark:border-emerald-500/15 dark:bg-emerald-500/9">
          <div
            className="absolute inset-y-0 left-0 w-0.5 bg-emerald-600/70 sm:w-1 dark:bg-emerald-500/80"
            aria-hidden
          />
          <div className="flex min-w-0 flex-col gap-3 p-4 pl-4.5 sm:gap-5 sm:p-6 sm:pl-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:p-7">
            <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/12 text-emerald-700 sm:size-12 dark:bg-emerald-400/15 dark:text-emerald-300">
                {isSuccess ? (
                  <CheckCircle2 className="size-5 stroke-[1.75] sm:size-6" aria-hidden />
                ) : (
                  <CalendarClock className="size-5 stroke-[1.75] sm:size-6" aria-hidden />
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg md:text-xl">
                  {isSuccess ? "Đã gửi yêu cầu đặt lịch" : "Chi tiết lịch hẹn"}
                </h1>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:mt-1.5 sm:text-sm">
                  {isSuccess
                    ? "Garage sẽ xem xét và phản hồi sớm. Bạn không cần thanh toán trước ở bước này."
                    : "Thông tin đặt chỗ, chi nhánh, khách, xe và tiến trình xử lý."}
                </p>
                {headerExtra}
              </div>
            </div>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 pl-13 sm:w-auto sm:pl-0 lg:flex-col lg:items-end lg:gap-2">
              <span className="rounded-full border border-emerald-800/15 bg-white/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-900/80 dark:border-emerald-400/25 dark:bg-emerald-950/40 dark:text-emerald-100">
                {(raw.status ?? "—").toString().toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5 overflow-hidden border-border/60 p-4 sm:space-y-8 sm:p-6 lg:border-r lg:p-8">
          <BookingRequireStepper serverStatus={raw.status ?? ""} layoutId={stepperLayoutId} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:gap-x-12">
            <FieldBlock kicker="Lịch hẹn">
              <div className="flex min-w-0 gap-2 sm:gap-2.5">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground sm:size-4" aria-hidden />
                <p className="min-w-0 wrap-break-word font-medium capitalize">
                  {scheduled.isValid() ? scheduled.format("dddd, D MMMM YYYY · HH:mm") : raw.scheduledAt}
                </p>
              </div>
            </FieldBlock>
            <FieldBlock kicker="Chi nhánh">
              <div className="flex min-w-0 gap-2 sm:gap-2.5">
                <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground sm:size-4" aria-hidden />
                <div className="min-w-0">
                  <p className="wrap-break-word font-medium">{raw.branch?.name ?? "—"}</p>
                  {raw.branch?.addressLine ? (
                    <p className="mt-1 wrap-break-word text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                      {raw.branch.addressLine}
                    </p>
                  ) : null}
                  {raw.branch?.garageBusinessName ? (
                    <p className="mt-1 text-[11px] text-muted-foreground/90 sm:mt-1.5 sm:text-xs">
                      {raw.branch.garageBusinessName}
                    </p>
                  ) : null}
                </div>
              </div>
            </FieldBlock>
          </div>

          {raw.note ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-3 dark:bg-muted/10 sm:rounded-xl sm:px-5 sm:py-3.5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[10px] sm:tracking-[0.12em]">
                Ghi chú
              </p>
              <p className="mt-1.5 max-w-full whitespace-pre-wrap wrap-break-word text-[13px] leading-relaxed text-foreground sm:mt-2 sm:text-sm">
                {raw.note}
              </p>
            </div>
          ) : null}

          <Separator className="bg-border/55" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:gap-x-12">
            <FieldBlock kicker="Khách">
              <p className="wrap-break-word font-medium">{q.customer?.name ?? raw.customer?.fullName ?? raw.customerName ?? "—"}</p>
              {q.customer?.phone && q.customer.phone !== "—" ? (
                <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">{q.customer.phone}</p>
              ) : raw.customer?.phoneNumber ? (
                <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
                  {raw.customer.phoneNumber}
                </p>
              ) : raw.customerPhone ? (
                <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">{raw.customerPhone}</p>
              ) : null}
              {q.customer?.email && q.customer.email !== "—" ? (
                <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">{q.customer.email}</p>
              ) : raw.customer?.email ? (
                <p className="mt-1 break-all text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">{raw.customer.email}</p>
              ) : null}
            </FieldBlock>
            <FieldBlock kicker="Xe">
              <p className="wrap-break-word font-medium tabular-nums">{q.vehicle?.licensePlate || raw.vehicle?.licensePlate || "—"}</p>
              <p className="mt-1 wrap-break-word text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">
                {[q.vehicle?.brand || raw.vehicle?.brandName || raw.vehicleBrand, q.vehicle?.model || raw.vehicle?.modelName || raw.vehicleModel]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </p>
              {raw.vehicle?.variantColor ? (
                <p className="mt-1 text-[13px] text-muted-foreground sm:mt-1.5 sm:text-sm">Màu {raw.vehicle.variantColor}</p>
              ) : null}
            </FieldBlock>
          </div>

          <FieldBlock kicker="Thợ / người xử lý">
            <p className="wrap-break-word font-medium">{q.mechanicLabel}</p>
          </FieldBlock>

          {q.historyEntries?.length ? (
            <>
              <Separator className="bg-border/55" />
              <div>
                <h2 className="text-[13px] font-semibold tracking-tight text-foreground sm:text-sm">Lịch sử trạng thái</h2>
                <ul className="relative mt-4">
                  <div
                    className="pointer-events-none absolute bottom-3 left-3 top-3 w-px -translate-x-1/2 bg-border"
                    aria-hidden
                  />
                  {[...q.historyEntries]
                    .sort(
                      (a, b) => new Date(b.entry.changedAt).getTime() - new Date(a.entry.changedAt).getTime(),
                    )
                    .map(({ entry: h, changedByLabel }, index) => {
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
                          <div className={cn("min-w-0 flex-1 pt-0", !isLatest && "text-muted-foreground")}>
                            <p
                              className={cn(
                                "text-sm font-medium leading-snug",
                                isLatest ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {bookingStatusLabelVi(h.fromStatus)} → {bookingStatusLabelVi(h.toStatus)}
                            </p>
                            <time
                              className={cn("mt-0.5 block text-xs", !isLatest && "text-muted-foreground/90")}
                              dateTime={h.changedAt}
                            >
                              {formatBookingRequireStatusHistoryTime(h.changedAt)}
                            </time>
                            <p className="mt-1 text-xs text-muted-foreground/90">
                              Bởi: <span className="font-medium text-foreground/90">{changedByLabel}</span>
                            </p>
                            {h.note ? <p className="mt-1 text-xs italic text-muted-foreground/90">{h.note}</p> : null}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-1.5 border-t border-border/40 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6 sm:text-xs">
            {raw.completedAt ? (
              <span>Hoàn thành: {formatBookingRequireStatusHistoryTime(raw.completedAt)}</span>
            ) : null}
            {raw.cancellationReason ? <span className="text-destructive">Hủy: {raw.cancellationReason}</span> : null}
            {raw.currentOdometer != null ? (
              <span>ODO: {raw.currentOdometer.toLocaleString("vi-VN")} km</span>
            ) : null}
            {raw.paymentId ? (
              <span className="break-all font-mono text-[10px] sm:text-[11px]">Thanh toán: {raw.paymentId}</span>
            ) : null}
          </div>
        </div>

        <aside className="min-w-0 overflow-hidden border-t border-border/60 bg-muted/20 p-4 sm:p-6 lg:max-h-[min(70dvh,720px)] lg:overflow-y-auto lg:border-t-0 lg:p-8 dark:bg-muted/10 [scrollbar-width:thin]">
          <div className="flex min-w-0 items-end justify-between gap-2 border-b border-border/50 pb-3 sm:gap-3 sm:pb-4">
            <h2 className="min-w-0 flex-1 wrap-break-word text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
              Dịch vụ đã đặt
            </h2>
            <p className="shrink-0 text-right text-base font-bold tabular-nums text-foreground sm:text-lg">
              {formatVnd(raw.bookedTotalAmount, raw.bookedCurrency)}
            </p>
          </div>
          <ul className="mt-0.5 min-w-0 sm:mt-1">
            {sortedLines.map((line) => (
              <LineRow key={line.id} line={line} compact />
            ))}
          </ul>
          {asideFooter}
        </aside>
      </div>
      {articleBottom}
    </article>
  );
}
