"use client";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBookingDetailEnrichedQuery } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

import { canAssignBookingMechanic } from "./assign-mechanic-dialog";

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

function bookingStatusLabel(status: string) {
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

function DetailStatusBadge({ status }: { status: string }) {
  if (status === "Pending") {
    return (
      <span
        className={cn(
          "inline-flex max-w-40 items-center rounded-full border px-2 py-px text-[10px] font-medium leading-tight sm:max-w-none sm:px-2.5 sm:py-0.5 sm:text-xs",
          "border-amber-500/40 bg-amber-500/12 text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-50",
        )}
      >
        {bookingStatusLabel(status)}
      </span>
    );
  }
  if (status === "Cancelled") {
    return (
      <Badge variant="destructive" className="h-5 px-1.5 py-0 text-[10px] sm:h-auto sm:px-2.5 sm:py-0.5 sm:text-xs">
        {bookingStatusLabel(status)}
      </Badge>
    );
  }
  const variant =
    status === "Completed" || status === "Confirmed" ? "default" : status === "InProgress" ? "secondary" : "outline";
  return (
    <Badge
      variant={variant}
      className="h-5 px-1.5 py-0 text-[10px] sm:h-auto sm:px-2.5 sm:py-0.5 sm:text-xs"
    >
      {bookingStatusLabel(status)}
    </Badge>
  );
}

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
            <div className="space-y-4 sm:space-y-6">
              <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    Trạng thái
                  </p>
                  <div className="mt-1 sm:mt-1.5">
                    <DetailStatusBadge status={q.data.raw.status} />
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                    Lịch hẹn
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground sm:mt-1 sm:text-base">
                    {formatDateTime(q.data.raw.scheduledAt)}
                  </p>
                </div>
              </section>

              {q.data.raw.note ? (
                <div className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 text-xs leading-relaxed sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm">
                  <span className="font-medium text-foreground">Ghi chú: </span>
                  <span className="text-muted-foreground">{q.data.raw.note}</span>
                </div>
              ) : null}

              <section className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xs font-semibold text-foreground sm:text-sm">Chi nhánh</h3>
                <div className="rounded-lg border border-border/60 bg-card/50 px-2.5 py-2 text-xs sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm">
                  <p className="font-medium leading-snug">{q.data.raw.branch.name}</p>
                  <p className="mt-0.5 text-muted-foreground">{q.data.raw.branch.addressLine}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">{q.data.raw.branch.garageBusinessName}</p>
                </div>
              </section>

              <Separator className="my-0" />

              <section className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-lg border border-border/60 bg-card/40 px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
                  <h3 className="text-xs font-semibold text-foreground sm:text-sm">Khách hàng</h3>
                  <dl className="mt-1.5 space-y-1.5 text-[13px] leading-snug sm:mt-2 sm:space-y-2 sm:text-sm">
                    <div>
                      <dt className="text-[10px] text-muted-foreground sm:text-xs">Tên</dt>
                      <dd className="font-medium text-foreground">{q.data.customer.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-muted-foreground sm:text-xs">Email</dt>
                      <dd className="break-all text-foreground">{q.data.customer.email}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-muted-foreground sm:text-xs">Số điện thoại</dt>
                      <dd className="tabular-nums text-foreground">{q.data.customer.phone}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 font-mono text-[10px] leading-tight text-muted-foreground sm:mt-3 sm:text-[11px]">
                    userId: {q.data.raw.userId}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 px-2.5 py-2.5 sm:rounded-xl sm:px-3 sm:py-3">
                  <h3 className="text-xs font-semibold text-foreground sm:text-sm">Xe</h3>
                  <dl className="mt-1.5 space-y-1.5 text-[13px] leading-snug sm:mt-2 sm:space-y-2 sm:text-sm">
                    <div>
                      <dt className="text-[10px] text-muted-foreground sm:text-xs">Hãng</dt>
                      <dd className="font-medium text-foreground">{q.data.vehicle.brand}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] text-muted-foreground sm:text-xs">Model</dt>
                      <dd className="font-medium text-foreground">{q.data.vehicle.model}</dd>
                    </div>
                    {q.data.vehicle.licensePlate ? (
                      <div>
                        <dt className="text-[10px] text-muted-foreground sm:text-xs">Biển số</dt>
                        <dd className="tabular-nums text-foreground">{q.data.vehicle.licensePlate}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="mt-2 font-mono text-[10px] leading-tight text-muted-foreground sm:mt-3 sm:text-[11px]">
                    userVehicleId: {q.data.raw.userVehicleId}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-semibold text-foreground sm:text-sm">Thợ / người xử lý</h3>
                      <p className="mt-1 text-[13px] text-foreground sm:text-sm">{q.data.mechanicLabel}</p>
                      {q.data.raw.mechanicId ? (
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground sm:text-[11px]">
                          mechanicId: {q.data.raw.mechanicId}
                        </p>
                      ) : null}
                    </div>
                    {garageId && branchId && onRequestAssign && canAssignBookingMechanic(q.data.raw.status) ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 w-full shrink-0 text-xs sm:w-auto"
                        onClick={() => onRequestAssign()}
                      >
                        Gán thợ
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>

              <Separator className="my-0" />

              <section className="space-y-2 sm:space-y-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xs font-semibold text-foreground sm:text-sm">Dòng đặt chỗ</h3>
                  <p className="text-xs font-semibold tabular-nums sm:text-sm">
                    Tổng: {formatVnd(q.data.raw.bookedTotalAmount, q.data.raw.bookedCurrency)}
                  </p>
                </div>

                {/* Mobile: thẻ — không cần cuộn ngang */}
                <div className="space-y-2 md:hidden">
                  {q.data.lineItems.map(({ line, title }) => (
                    <div
                      key={line.id}
                      className="rounded-lg border border-border/60 bg-card/30 px-2.5 py-2.5 text-[13px] leading-snug"
                    >
                      <p className="font-medium text-foreground">{title}</p>
                      {line.bundleDetails ? (
                        <ul className="mt-1.5 list-inside list-disc text-[11px] text-muted-foreground">
                          {line.bundleDetails.items.map((bi, i) => (
                            <li key={i}>
                              {bi.itemName?.trim() ||
                                (bi.productId ? "Phụ tùng" : bi.serviceId ? "Dịch vụ" : "Mục trong combo")}
                              {bi.includeInstallation ? " (+ lắp)" : ""}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-[11px]">
                        <span className="text-muted-foreground">Lắp đặt</span>
                        <span className="text-foreground">{line.includeInstallation ? "Có" : "Không"}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 font-semibold tabular-nums">
                        <span className="text-[11px] font-normal text-muted-foreground">Giá</span>
                        <span className="text-sm text-foreground">{formatVnd(line.bookedItemAmount, line.bookedItemCurrency)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* md+: bảng */}
                <div className="hidden overflow-x-auto rounded-xl border border-border/60 md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-[200px]">Mục</TableHead>
                        <TableHead className="text-right">Giá</TableHead>
                        <TableHead className="w-[100px] text-center">Lắp đặt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {q.data.lineItems.map(({ line, title }) => (
                        <TableRow key={line.id}>
                          <TableCell className="align-top">
                            <span className="font-medium">{title}</span>
                            {line.bundleDetails ? (
                              <ul className="mt-1.5 list-inside list-disc text-xs text-muted-foreground">
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
                          <TableCell className="align-top text-right font-medium tabular-nums">
                            {formatVnd(line.bookedItemAmount, line.bookedItemCurrency)}
                          </TableCell>
                          <TableCell className="align-top text-center text-sm text-muted-foreground">
                            {line.includeInstallation ? "Có" : "Không"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              {q.data.historyEntries.length > 0 ? (
                <>
                  <Separator className="my-0" />
                  <section className="space-y-2 sm:space-y-2.5">
                    <h3 className="text-xs font-semibold text-foreground sm:text-sm">Lịch sử trạng thái</h3>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {q.data.historyEntries.map(({ entry, changedByLabel }) => (
                        <li
                          key={entry.id}
                          className="rounded-lg border border-border/50 bg-muted/15 px-2.5 py-2 text-[12px] leading-snug sm:px-3 sm:py-2 sm:text-sm"
                        >
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-medium">
                              {bookingStatusLabel(entry.fromStatus)} → {bookingStatusLabel(entry.toStatus)}
                            </span>
                            <span className="text-[10px] text-muted-foreground sm:text-xs">
                              {formatDateTime(entry.changedAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                            Bởi: <span className="text-foreground">{changedByLabel}</span>
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

              <div className="flex flex-col gap-1 border-t border-border/50 pt-2.5 text-[10px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1 sm:pt-3 sm:text-xs">
                {q.data.raw.completedAt ? <span>Hoàn thành: {formatDateTime(q.data.raw.completedAt)}</span> : null}
                {q.data.raw.cancellationReason ? (
                  <span className="text-destructive">Hủy: {q.data.raw.cancellationReason}</span>
                ) : null}
                {q.data.raw.paymentId ? <span className="break-all font-mono">paymentId: {q.data.raw.paymentId}</span> : null}
                {q.data.raw.currentOdometer != null ? (
                  <span>ODO: {q.data.raw.currentOdometer.toLocaleString("vi-VN")} km</span>
                ) : null}
              </div>
            </div>
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
