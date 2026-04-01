"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { ArrowLeft, Building2, CheckCircle2, Clock } from "lucide-react";

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
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-border/40 py-3.5 last:border-b-0",
        compact && "py-3",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium leading-snug text-foreground", compact ? "text-sm" : "text-[15px]")}>
          {line.itemName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{lineKindLabel(line)}</p>
        {line.bundleDetails?.items?.length ? (
          <ul className="mt-2 space-y-0.5 border-l-2 border-primary/20 pl-3 text-[11px] text-muted-foreground">
            {line.bundleDetails.items.map((bi, i) => (
              <li key={`${bi.itemName}-${i}`}>
                {bi.itemName}
                {bi.includeInstallation ? " · lắp đặt" : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <span className="shrink-0 tabular-nums text-sm font-semibold text-foreground">
        {formatVnd(line.bookedItemAmount, line.bookedItemCurrency)}
      </span>
    </li>
  );
}

function FieldBlock({
  kicker,
  children,
  className,
}: {
  kicker: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{kicker}</p>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}

export function BookingSuccessClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const payload = useMemo(() => {
    if (!bookingId) return null;
    return readCreatedBookingResponse(bookingId);
  }, [bookingId]);

  const data: BookingDetailDto | null | undefined = payload?.data ?? undefined;

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
        <p className="mt-3 break-all font-mono text-xs text-foreground/80">{bookingId}</p>
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
    <div className="min-h-0 w-full bg-linear-to-b from-muted/45 to-background pb-12 pt-5 dark:from-muted/20 sm:pb-16 sm:pt-6">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-5 h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground sm:mb-6"
          asChild
        >
          <Link href="/user/garage">
            <ArrowLeft className="size-4" aria-hidden />
            Garage
          </Link>
        </Button>

        <article className="overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-[0_1px_0_rgba(0,0,0,0.04),0_16px_40px_-18px_rgba(0,0,0,0.14)] dark:border-border/50 dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_20px_50px_-20px_rgba(0,0,0,0.5)]">
          {/* Header ngang: icon + copy | mã + trạng thái */}
          <div className="relative border-b border-emerald-600/10 bg-emerald-500/[0.07] dark:border-emerald-500/15 dark:bg-emerald-500/9">
            <div className="absolute inset-y-0 left-0 w-1 bg-emerald-600/70 dark:bg-emerald-500/80" aria-hidden />
            <div className="flex flex-col gap-5 p-5 pl-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-7">
              <div className="flex min-w-0 gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-600/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  <CheckCircle2 className="size-6 stroke-[1.75]" aria-hidden />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Đã gửi yêu cầu đặt lịch</h1>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Garage sẽ xem xét và phản hồi sớm. Bạn không cần thanh toán trước ở bước này.
                  </p>
                  {successFootnote ? (
                    <p className="mt-2.5 text-xs font-medium text-emerald-800/90 dark:text-emerald-200/90">{successFootnote}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end lg:gap-2">
                <span
                  className="inline-flex max-w-full items-center rounded-md bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-medium text-primary tabular-nums"
                  title={data.id}
                >
                  # {data.id}
                </span>
                <span className="rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground dark:bg-background/40">
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Thân: trái thông tin | phải biên lai */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-8 border-border/60 p-5 sm:p-6 lg:border-r lg:p-8">
              <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-12">
                <FieldBlock kicker="Lịch hẹn">
                  <div className="flex gap-2.5">
                    <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <p className="font-medium capitalize">
                      {scheduled.isValid() ? scheduled.format("dddd, D MMMM YYYY · HH:mm") : data.scheduledAt}
                    </p>
                  </div>
                </FieldBlock>
                <FieldBlock kicker="Chi nhánh">
                  <div className="flex gap-2.5">
                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <p className="font-medium">{data.branch?.name ?? "—"}</p>
                      {data.branch?.addressLine ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{data.branch.addressLine}</p>
                      ) : null}
                      {data.branch?.garageBusinessName ? (
                        <p className="mt-1.5 text-xs text-muted-foreground/90">{data.branch.garageBusinessName}</p>
                      ) : null}
                    </div>
                  </div>
                </FieldBlock>
              </div>

              {data.note ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-3.5 dark:bg-muted/10 sm:px-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ghi chú</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{data.note}</p>
                </div>
              ) : null}

              <Separator className="bg-border/55" />

              <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-12">
                <FieldBlock kicker="Khách">
                  <p className="font-medium">{data.customer?.fullName ?? "—"}</p>
                  {data.customer?.phoneNumber ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">{data.customer.phoneNumber}</p>
                  ) : null}
                  {data.customer?.email ? (
                    <p className="mt-1.5 truncate text-sm text-muted-foreground">{data.customer.email}</p>
                  ) : null}
                </FieldBlock>
                <FieldBlock kicker="Xe">
                  <p className="font-medium tabular-nums">{data.vehicle?.licensePlate ?? "—"}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {[data.vehicle?.brandName, data.vehicle?.modelName].filter(Boolean).join(" ") || "—"}
                  </p>
                  {data.vehicle?.variantColor ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">Màu {data.vehicle.variantColor}</p>
                  ) : null}
                </FieldBlock>
              </div>

              {data.statusHistory?.length ? (
                <>
                  <Separator className="bg-border/55" />
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Lịch sử trạng thái</h2>
                    <ul className="mt-3 divide-y divide-border/45 border-t border-border/45">
                      {data.statusHistory.map((h) => (
                        <li key={h.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-3">
                          <span className="text-sm font-medium text-foreground">
                            {h.fromStatus} → {h.toStatus}
                          </span>
                          <time
                            className="shrink-0 text-xs tabular-nums text-muted-foreground"
                            dateTime={h.changedAt}
                          >
                            {dayjs(h.changedAt).isValid() ? dayjs(h.changedAt).format("D/M/YYYY HH:mm") : h.changedAt}
                          </time>
                          {h.note ? <p className="w-full text-xs text-muted-foreground">{h.note}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>

            {/* Cột phải: tóm tắt đơn — sticky trên desktop */}
            <aside className="border-t border-border/60 bg-muted/20 p-5 sm:p-6 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:border-t-0 lg:p-8 dark:bg-muted/10 [scrollbar-width:thin]">
              <div className="flex items-end justify-between gap-3 border-b border-border/50 pb-4">
                <h2 className="text-base font-semibold tracking-tight text-foreground">Dịch vụ đã đặt</h2>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {formatVnd(data.bookedTotalAmount, data.bookedCurrency)}
                </p>
              </div>
              <ul className="mt-1">
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

          <div className="border-t border-border/60 bg-muted/25 px-5 py-4 dark:bg-muted/15 lg:hidden sm:px-6">
            <Button asChild className="h-12 w-full rounded-xl text-base font-semibold shadow-sm" size="lg">
              <Link href="/user/garage">Về trang garage</Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
