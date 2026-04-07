"use client";

import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** YYYY-MM-DD theo giờ local — gom đơn theo “ngày” như lịch. */
export function localDateKeyFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function localDateKeyFromDate(ref: Date): string {
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  const day = String(ref.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTimeOnly(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(d);
  } catch {
    return "—";
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

const badgeBase =
  "inline-flex max-w-38 items-center rounded-full border font-medium leading-tight transition-colors";
const compactSize = "border px-1.5 py-px text-[10px]";
const normalSize = "px-2.5 py-0.5 text-xs";

/** Màu tách bạch theo trạng thái (light + dark). */
function statusToneClasses(status: string): string {
  switch (status) {
    case "Pending":
      return "border-amber-500/45 bg-amber-500/18 text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/14 dark:text-amber-50";
    case "AwaitingConfirmation":
      return "border-sky-500/45 bg-sky-500/16 text-sky-950 dark:border-sky-400/40 dark:bg-sky-500/14 dark:text-sky-50";
    case "Confirmed":
      return "border-emerald-500/45 bg-emerald-500/14 text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-500/12 dark:text-emerald-50";
    case "InProgress":
      return "border-blue-500/45 bg-blue-500/14 text-blue-950 dark:border-blue-400/40 dark:bg-blue-500/14 dark:text-blue-50";
    case "Completed":
      return "border-violet-500/40 bg-violet-500/12 text-violet-950 dark:border-violet-400/35 dark:bg-violet-500/12 dark:text-violet-50";
    case "Cancelled":
      return "border-rose-500/50 bg-rose-500/14 text-rose-950 dark:border-rose-400/45 dark:bg-rose-500/14 dark:text-rose-50";
    default:
      return "border-border/80 bg-muted/50 text-foreground dark:bg-muted/35";
  }
}

export function BookingStatusBadge({ status, compact }: { status: string; compact?: boolean }) {
  const label = bookingStatusLabel(status);
  return (
    <span
      className={cn(badgeBase, compact ? compactSize : normalSize, statusToneClasses(status))}
    >
      {label}
    </span>
  );
}

/** Map dateKey → bookings sorted by time */
export function mapBookingsByLocalDay(rows: BookingListItemDto[]) {
  const map = new Map<string, BookingListItemDto[]>();
  for (const row of rows) {
    const key = localDateKeyFromIso(row.scheduledAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }
  return map;
}
