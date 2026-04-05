"use client";

import { Fragment, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarRange, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBranchBookingsQuery } from "@/hooks/useBookings";
import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

import { AssignMechanicDialog, canAssignBookingMechanic } from "./assign-mechanic-dialog";
import { BookingDetailDialog } from "./booking-detail-dialog";

const PAGE_SIZE = 10;

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** YYYY-MM-DD theo giờ local — gom đơn theo “ngày” như lịch. */
function localDateKeyFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDateKeyFromDate(ref: Date): string {
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  const day = String(ref.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daySectionTitle(dateKey: string): string {
  const now = new Date();
  const todayK = localDateKeyFromDate(now);
  const t1 = new Date(now);
  t1.setDate(t1.getDate() + 1);
  const tomorrowK = localDateKeyFromDate(t1);
  const y1 = new Date(now);
  y1.setDate(y1.getDate() - 1);
  const yesterdayK = localDateKeyFromDate(y1);

  if (dateKey === todayK) return "Hôm nay";
  if (dateKey === tomorrowK) return "Ngày mai";
  if (dateKey === yesterdayK) return "Hôm qua";

  const [yy, mm, dd] = dateKey.split("-").map(Number);
  if (!yy || !mm || !dd) return dateKey;
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(yy, mm - 1, dd, 12, 0, 0, 0));
}

function groupBookingsByLocalDay(rows: BookingListItemDto[]) {
  const map = new Map<string, BookingListItemDto[]>();
  for (const row of rows) {
    const key = localDateKeyFromIso(row.scheduledAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  const keys = [...map.keys()].sort();
  return keys.map((dateKey) => {
    const items = map.get(dateKey)!;
    items.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return {
      dateKey,
      title: daySectionTitle(dateKey),
      count: items.length,
      items,
    };
  });
}

function formatTimeOnly(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(d);
  } catch {
    return "—";
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

function BookingStatusBadge({ status, compact }: { status: string; compact?: boolean }) {
  const label = bookingStatusLabel(status);

  if (status === "Pending") {
    return (
      <span
        className={cn(
          "inline-flex max-w-[9.5rem] items-center rounded-full border font-medium leading-tight",
          compact ? "border px-1.5 py-px text-[10px]" : "px-2.5 py-0.5 text-xs",
          "border-amber-500/40 bg-amber-500/12 text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-50",
        )}
      >
        {label}
      </span>
    );
  }

  if (status === "Cancelled") {
    return (
      <Badge variant="destructive" className={cn("font-normal", compact && "h-5 px-1.5 py-0 text-[10px]")}>
        {label}
      </Badge>
    );
  }

  const variant =
    status === "Completed" || status === "Confirmed" ? "default" : status === "InProgress" ? "secondary" : "outline";

  return (
    <Badge variant={variant} className={cn("font-normal", compact && "h-5 px-1.5 py-0 text-[10px]")}>
      {label}
    </Badge>
  );
}

function BookingsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 bg-muted/30 px-3 py-2.5 md:px-4 md:py-3">
        <Skeleton className="h-4 w-32 md:h-5 md:w-40" />
        <Skeleton className="mt-1.5 h-3 w-full max-w-[16rem] md:mt-2 md:h-4" />
      </div>
      <div className="md:hidden">
        {Array.from({ length: 3 }).map((_, r) => (
          <div key={r} className="space-y-2 border-b border-border/60 px-3 py-3 last:border-b-0">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-full rounded" />
            <Skeleton className="h-2.5 w-[88%] rounded" />
            <div className="flex justify-between gap-2 pt-0.5">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-8 w-[7.25rem] rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden p-4 md:block">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, r) => (
            <div key={r} className="flex gap-4">
              <Skeleton className="h-12 w-28 shrink-0 rounded-lg" />
              <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
              <Skeleton className="h-4 min-w-0 flex-1 rounded" />
              <Skeleton className="h-4 w-24 shrink-0 rounded" />
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <Skeleton className="h-9 w-30 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatalogError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/25 bg-destructive/6 p-5 text-sm shadow-sm">
      <p className="text-destructive">{message}</p>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void onRetry()}>
        Thử lại
      </Button>
    </div>
  );
}

function paginationRange(pageNumber: number, pageSize: number, totalItems: number) {
  if (totalItems <= 0) return { start: 0, end: 0 };
  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalItems);
  return { start, end };
}

export default function BranchBookingsPage() {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";
  const branchId = typeof params?.branchId === "string" ? params.branchId : "";
  const [page, setPage] = useState(1);
  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);
  const [assignBookingId, setAssignBookingId] = useState<string | null>(null);

  const q = useBranchBookingsQuery(branchId || undefined, {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    enabled: Boolean(branchId),
  });

  const rows = q.data?.data ?? [];
  const metadata = q.data?.metadata ?? null;

  const range = useMemo(() => {
    if (!metadata) return null;
    return paginationRange(metadata.pageNumber, metadata.pageSize, metadata.totalItems);
  }, [metadata]);

  const grouped = useMemo(() => groupBookingsByLocalDay(rows), [rows]);

  return (
    <div className="w-full min-w-0 space-y-5 md:space-y-8">
      <header className="space-y-1.5 md:space-y-1">
        <div className="flex items-center gap-2 md:gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/50 text-muted-foreground shadow-sm md:size-9 md:rounded-xl">
            <CalendarRange className="size-4 md:size-[18px]" aria-hidden />
          </span>
          <h2 className="text-xl font-semibold tracking-tight md:text-3xl">Lịch hẹn</h2>
        </div>
        <p className="max-w-3xl text-xs leading-snug text-muted-foreground md:text-[15px] md:leading-relaxed">
          Đơn được gom theo ngày (Hôm nay, Ngày mai, …) kèm số đơn trong ngày. Bấm Chi tiết để xem khách, xe và dòng đặt
          chỗ.
        </p>
      </header>

      {!branchId ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Thiếu mã chi nhánh.
        </p>
      ) : q.isPending ? (
        <BookingsTableSkeleton />
      ) : q.isError ? (
        <CatalogError
          message={q.error?.message ?? "Không tải được danh sách lịch hẹn."}
          onRetry={() => void q.refetch()}
        />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center">
          <CalendarRange className="mb-3 size-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm font-medium text-foreground">Chưa có lịch hẹn</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Khi khách đặt chỗ, danh sách sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm ring-1 ring-black/3 md:rounded-2xl dark:ring-white/4">
          {/* Mobile: thẻ gọn — cỡ chữ & nút vừa mắt */}
          <div className="md:hidden">
            {grouped.map((group) => (
              <section key={group.dateKey} className="border-b border-border/50 last:border-b-0">
                <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-muted/40 px-3 py-2">
                  <h3 className="text-xs font-semibold leading-tight text-foreground">{group.title}</h3>
                  <span className="shrink-0 rounded-full bg-background/90 px-2 py-px text-[10px] font-medium tabular-nums text-muted-foreground ring-1 ring-border/50">
                    {group.count} đơn
                  </span>
                </div>
                {group.items.map((row) => {
                  const time = formatTimeOnly(row.scheduledAt);
                  const summary = row.itemsSummary?.trim();
                  return (
                    <article key={row.id} className="border-b border-border/35 px-3 py-3 last:border-b-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-lg font-semibold tabular-nums leading-none tracking-tight text-foreground">
                            {time}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">Giờ hẹn</p>
                        </div>
                        <BookingStatusBadge status={row.status} compact />
                      </div>

                      <div className="mt-2.5 min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tóm tắt</p>
                        <p className="mt-0.5 wrap-break-word text-[13px] leading-snug text-muted-foreground">
                          {summary || "—"}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Tổng tiền
                          </p>
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {formatVnd(row.bookedTotalAmount)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 px-2.5 text-xs"
                            aria-label="Xem chi tiết lịch hẹn"
                            onClick={() => setDetailBookingId(row.id)}
                          >
                            <Eye className="size-3.5" aria-hidden />
                            Chi tiết
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-8 touch-manipulation px-2.5 text-xs shadow-none"
                            disabled={!canAssignBookingMechanic(row.status)}
                            title={
                              canAssignBookingMechanic(row.status)
                                ? "Gán thợ máy cho lịch hẹn"
                                : "Chỉ gán khi trạng thái Chờ xử lý hoặc Chờ xác nhận"
                            }
                            onClick={() => setAssignBookingId(row.id)}
                          >
                            Gán NV
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ))}
          </div>

          {/* Desktop: bảng */}
          <div className="hidden overflow-x-auto md:block">
            <Table className="min-w-[72rem] table-fixed lg:min-w-[80rem]">
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-11 w-[11rem] whitespace-nowrap bg-muted/35 pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Giờ hẹn
                  </TableHead>
                  <TableHead className="h-11 w-[8.5rem] bg-muted/35 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Trạng thái
                  </TableHead>
                  <TableHead className="h-11 min-w-0 bg-muted/35 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tóm tắt
                  </TableHead>
                  <TableHead className="h-11 w-[9rem] whitespace-nowrap bg-muted/35 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="h-11 w-[5.5rem] bg-muted/35 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Chi tiết
                  </TableHead>
                  <TableHead className="h-11 w-[10.5rem] whitespace-nowrap bg-muted/35 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.map((group) => (
                  <Fragment key={group.dateKey}>
                    <TableRow className="border-border/50 bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={6} className="py-2.5 pl-4 pr-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">{group.title}</span>
                          <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground ring-1 ring-border/50">
                            {group.count} đơn
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {group.items.map((row) => {
                      const time = formatTimeOnly(row.scheduledAt);
                      return (
                        <TableRow key={row.id} className="border-border/50 transition-colors hover:bg-muted/25">
                          <TableCell className="align-middle pl-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold tabular-nums text-foreground">{time}</span>
                              <span className="text-[11px] text-muted-foreground">Theo giờ đặt</span>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle">
                            <BookingStatusBadge status={row.status} />
                          </TableCell>
                          <TableCell className="align-middle">
                            <p
                              className="line-clamp-3 text-sm leading-snug text-muted-foreground"
                              title={row.itemsSummary?.trim() || undefined}
                            >
                              {row.itemsSummary?.trim() ? row.itemsSummary : "—"}
                            </p>
                          </TableCell>
                          <TableCell className="align-middle text-right">
                            <span className="text-sm font-semibold tabular-nums text-foreground">
                              {formatVnd(row.bookedTotalAmount)}
                            </span>
                          </TableCell>
                          <TableCell className="align-middle text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-muted-foreground hover:text-foreground"
                              aria-label="Xem chi tiết lịch hẹn"
                              onClick={() => setDetailBookingId(row.id)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TableCell>
                          <TableCell className="align-middle pr-4 text-right">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="touch-manipulation shadow-none"
                              disabled={!canAssignBookingMechanic(row.status)}
                              title={
                                canAssignBookingMechanic(row.status)
                                  ? "Gán thợ máy cho lịch hẹn"
                                  : "Chỉ gán khi trạng thái Chờ xử lý hoặc Chờ xác nhận"
                              }
                              onClick={() => setAssignBookingId(row.id)}
                            >
                              Gán nhân viên
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>

          {metadata && range ? (
            <footer className="flex flex-col gap-2.5 border-t border-border/60 bg-muted/20 px-3 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3.5 sm:text-sm">
              <p className="text-muted-foreground">
                Hiển thị{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {range.start}–{range.end}
                </span>{" "}
                trong <span className="font-medium tabular-nums text-foreground">{metadata.totalItems}</span> lịch hẹn
                <span className="hidden sm:inline"> · </span>
                <span className="block text-[11px] text-muted-foreground/90 sm:inline sm:text-sm">
                  {metadata.pageSize} mục/trang
                </span>
                {q.isFetching ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Đang tải
                  </span>
                ) : null}
              </p>

              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={metadata.pageNumber <= 1 || q.isFetching}
                  className="h-8 gap-0.5 rounded-lg border-border/70 px-2.5 text-xs sm:h-9 sm:gap-1 sm:rounded-xl sm:px-3 sm:text-sm"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-3.5 sm:size-4" aria-hidden />
                  Trước
                </Button>
                <div
                  className="flex h-8 min-w-[6.5rem] items-center justify-center rounded-lg border border-border/60 bg-background px-2 text-xs tabular-nums shadow-sm sm:h-9 sm:min-w-30 sm:rounded-xl sm:px-3 sm:text-sm"
                  aria-live="polite"
                >
                  <span className="text-muted-foreground">Trang</span>
                  <span className="mx-1 font-semibold text-foreground sm:mx-1.5">{metadata.pageNumber}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="ml-0.5 font-medium text-foreground sm:ml-1">{metadata.totalPages}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(metadata.totalPages, p + 1))}
                  disabled={metadata.pageNumber >= metadata.totalPages || q.isFetching}
                  className="h-8 gap-0.5 rounded-lg border-border/70 px-2.5 text-xs sm:h-9 sm:gap-1 sm:rounded-xl sm:px-3 sm:text-sm"
                  aria-label="Trang sau"
                >
                  Sau
                  <ChevronRight className="size-3.5 sm:size-4" aria-hidden />
                </Button>
              </div>
            </footer>
          ) : null}
        </div>
      )}

      <BookingDetailDialog
        open={Boolean(detailBookingId)}
        onOpenChange={(o) => {
          if (!o) setDetailBookingId(null);
        }}
        bookingId={detailBookingId}
        garageId={garageId}
        branchId={branchId}
        onRequestAssign={() => {
          if (detailBookingId) setAssignBookingId(detailBookingId);
        }}
      />

      {garageId && branchId ? (
        <AssignMechanicDialog
          open={Boolean(assignBookingId)}
          onOpenChange={(o) => {
            if (!o) setAssignBookingId(null);
          }}
          bookingId={assignBookingId}
          garageId={garageId}
          branchId={branchId}
        />
      ) : null}
    </div>
  );
}
