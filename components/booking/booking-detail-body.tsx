"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EnrichedBookingDetail } from "@/lib/booking/enrich-booking-detail";
import { cn } from "@/lib/utils";

function formatVnd(amount: number | null | undefined, currency = "VND") {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function bookingStatusLabel(status: string) {
  const map: Record<string, string> = {
    Pending: "Chờ xử lý",
    AwaitingConfirmation: "Chờ xác nhận",
    Confirmed: "Đã xác nhận",
    InProgress: "Đang thực hiện",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
  };
  return map[status] ?? status;
}

function canAssignBookingMechanic(status: string) {
  return status === "Pending" || status === "AwaitingConfirmation";
}

function DetailStatusBadge({ status }: { status: string }) {
  if (status === "Pending") {
    return (
      <span
        className={cn(
          "inline-flex max-w-[min(100%,14rem)] items-center rounded-full border px-3 py-1 text-xs font-medium leading-snug sm:max-w-none sm:px-3.5 sm:py-1.5 sm:text-sm",
          "border-amber-500/40 bg-amber-500/12 text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-50",
        )}
      >
        {bookingStatusLabel(status)}
      </span>
    );
  }
  if (status === "Cancelled") {
    return (
      <Badge variant="destructive" className="h-auto min-h-8 px-3 py-1.5 text-xs sm:min-h-9 sm:px-3.5 sm:py-2 sm:text-sm">
        {bookingStatusLabel(status)}
      </Badge>
    );
  }
  const variant =
    status === "Completed" || status === "Confirmed" ? "default" : status === "InProgress" ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="h-auto min-h-8 px-3 py-1.5 text-xs sm:min-h-9 sm:px-3.5 sm:py-2 sm:text-sm">
      {bookingStatusLabel(status)}
    </Badge>
  );
}

export type BookingDetailBodyProps = {
  data: EnrichedBookingDetail;
  /** Gán thợ — chỉ garage dashboard */
  garageId?: string;
  branchId?: string;
  onRequestAssign?: () => void;
};

export function BookingDetailBody({ data: q, garageId, branchId, onRequestAssign }: BookingDetailBodyProps) {
  const showAssign = Boolean(garageId && branchId && onRequestAssign && canAssignBookingMechanic(q.raw.status));

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">Trạng thái</p>
          <div className="mt-2 sm:mt-2.5">
            <DetailStatusBadge status={q.raw.status} />
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">Lịch hẹn</p>
          <p className="mt-1 text-base font-semibold leading-snug text-foreground sm:mt-1.5 sm:text-lg">
            {formatDateTime(q.raw.scheduledAt)}
          </p>
        </div>
      </section>

      {q.raw.note ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base">
          <span className="font-medium text-foreground">Ghi chú: </span>
          <span className="text-muted-foreground">{q.raw.note}</span>
        </div>
      ) : null}

      <section className="space-y-2 sm:space-y-3">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">Chi nhánh</h3>
        <div className="rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-sm sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base">
          <p className="font-medium leading-snug">{q.raw.branch.name}</p>
          <p className="mt-1 text-muted-foreground">{q.raw.branch.addressLine}</p>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{q.raw.branch.garageBusinessName}</p>
        </div>
      </section>

      <Separator className="my-0" />

      <section className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-4 sm:rounded-2xl sm:px-5 sm:py-5">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">Khách hàng</h3>
          <dl className="mt-3 space-y-2.5 text-sm leading-snug sm:mt-4 sm:space-y-3 sm:text-base">
            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">Tên</dt>
              <dd className="mt-0.5 font-medium text-foreground">{q.customer.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">Email</dt>
              <dd className="mt-0.5 break-all text-foreground">{q.customer.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">Số điện thoại</dt>
              <dd className="mt-0.5 tabular-nums text-foreground">{q.customer.phone}</dd>
            </div>
          </dl>
          <p className="mt-3 font-mono text-[11px] leading-tight text-muted-foreground sm:mt-4 sm:text-xs">
            userId: {q.raw.userId}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-4 sm:rounded-2xl sm:px-5 sm:py-5">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">Xe</h3>
          <dl className="mt-3 space-y-2.5 text-sm leading-snug sm:mt-4 sm:space-y-3 sm:text-base">
            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">Hãng</dt>
              <dd className="mt-0.5 font-medium text-foreground">{q.vehicle.brand}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">Model</dt>
              <dd className="mt-0.5 font-medium text-foreground">{q.vehicle.model}</dd>
            </div>
            {q.vehicle.licensePlate ? (
              <div>
                <dt className="text-xs text-muted-foreground sm:text-sm">Biển số</dt>
                <dd className="mt-0.5 tabular-nums text-foreground">{q.vehicle.licensePlate}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-3 font-mono text-[11px] leading-tight text-muted-foreground sm:mt-4 sm:text-xs">
            userVehicleId: {q.raw.userVehicleId}
          </p>
        </div>
        <div className="sm:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">Thợ / người xử lý</h3>
              <p className="mt-2 text-base text-foreground sm:text-lg">{q.mechanicLabel}</p>
              {q.raw.mechanicId ? (
                <p className="mt-1 font-mono text-[11px] text-muted-foreground sm:text-xs">
                  mechanicId: {q.raw.mechanicId}
                </p>
              ) : null}
            </div>
            {showAssign ? (
              <Button
                type="button"
                variant="secondary"
                size="default"
                className="h-11 w-full shrink-0 text-sm sm:h-10 sm:w-auto"
                onClick={() => onRequestAssign?.()}
              >
                Gán thợ
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <Separator className="my-0" />

      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">Dòng đặt chỗ</h3>
          <p className="text-sm font-semibold tabular-nums sm:text-base">
            Tổng: {formatVnd(q.raw.bookedTotalAmount, q.raw.bookedCurrency)}
          </p>
        </div>

        <div className="space-y-3 md:hidden">
          {q.lineItems.map(({ line, title }) => (
            <div
              key={line.id}
              className="rounded-xl border border-border/60 bg-card/30 px-4 py-4 text-base leading-snug sm:rounded-2xl sm:px-5 sm:py-5"
            >
              <p className="font-semibold text-foreground">{title}</p>
              {line.bundleDetails ? (
                <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                  {line.bundleDetails.items.map((bi, i) => (
                    <li key={i}>
                      {bi.itemName?.trim() ||
                        (bi.productId ? "Phụ tùng" : bi.serviceId ? "Dịch vụ" : "Mục trong combo")}
                      {bi.includeInstallation ? " (+ lắp)" : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3 text-sm">
                <span className="text-muted-foreground">Lắp đặt</span>
                <span className="font-medium text-foreground">{line.includeInstallation ? "Có" : "Không"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 font-semibold tabular-nums">
                <span className="text-sm font-normal text-muted-foreground">Giá</span>
                <span className="text-lg text-foreground">{formatVnd(line.bookedItemAmount, line.bookedItemCurrency)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-border/60 md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[220px] py-4 text-sm font-semibold md:text-base">Mục</TableHead>
                <TableHead className="py-4 text-right text-sm font-semibold md:text-base">Giá</TableHead>
                <TableHead className="w-[120px] py-4 text-center text-sm font-semibold md:text-base">Lắp đặt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.lineItems.map(({ line, title }) => (
                <TableRow key={line.id}>
                  <TableCell className="align-top py-4 text-sm md:py-5 md:text-base">
                    <span className="font-semibold">{title}</span>
                    {line.bundleDetails ? (
                      <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                        {line.bundleDetails.items.map((bi, i) => (
                          <li key={i}>
                            {bi.itemName?.trim() ||
                              (bi.productId ? "Phụ tùng" : bi.serviceId ? "Dịch vụ" : "Mục trong combo")}
                            {bi.includeInstallation ? " (+ lắp)" : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-top py-4 text-right text-sm font-semibold tabular-nums md:py-5 md:text-base">
                    {formatVnd(line.bookedItemAmount, line.bookedItemCurrency)}
                  </TableCell>
                  <TableCell className="align-top py-4 text-center text-sm text-muted-foreground md:py-5 md:text-base">
                    {line.includeInstallation ? "Có" : "Không"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {q.historyEntries.length > 0 ? (
        <>
          <Separator className="my-0" />
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-sm font-semibold text-foreground sm:text-base">Lịch sử trạng thái</h3>
            <ul className="space-y-2 sm:space-y-3">
              {q.historyEntries.map(({ entry, changedByLabel }) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3 text-sm leading-snug sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold">
                      {bookingStatusLabel(entry.fromStatus)} → {bookingStatusLabel(entry.toStatus)}
                    </span>
                    <span className="text-xs text-muted-foreground sm:text-sm">{formatDateTime(entry.changedAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Bởi: <span className="font-medium text-foreground">{changedByLabel}</span>
                    {entry.note ? (
                      <>
                        {" "}
                        — <span className="italic">{entry.note}</span>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2 sm:pt-5 sm:text-sm">
        {q.raw.completedAt ? <span>Hoàn thành: {formatDateTime(q.raw.completedAt)}</span> : null}
        {q.raw.cancellationReason ? (
          <span className="text-destructive">Hủy: {q.raw.cancellationReason}</span>
        ) : null}
        {q.raw.paymentId ? <span className="break-all font-mono">paymentId: {q.raw.paymentId}</span> : null}
        {q.raw.currentOdometer != null ? (
          <span>ODO: {q.raw.currentOdometer.toLocaleString("vi-VN")} km</span>
        ) : null}
      </div>
    </div>
  );
}
