"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

import { localDateKeyFromDate, mapBookingsByLocalDay } from "./bookings-shared";

const WEEKDAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = x.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + offset);
  return x;
}

/** Các tuần (mỗi tuần 7 ngày T2→CN) phủ toàn bộ tháng `month` (0–11). */
function buildMonthWeeks(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const lastSundayOfMonth = startOfWeekMonday(lastOfMonth);
  lastSundayOfMonth.setDate(lastSundayOfMonth.getDate() + 6);

  let weekStart = startOfWeekMonday(firstOfMonth);
  const weeks: Date[][] = [];

  while (weekStart.getTime() <= lastSundayOfMonth.getTime()) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const cell = new Date(weekStart);
      cell.setDate(weekStart.getDate() + i);
      week.push(cell);
    }
    weeks.push(week);
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    weekStart = next;
  }

  return weeks;
}

function monthTitleVi(year: number, month: number): string {
  return new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
}

function BranchBookingsCalendarSkeleton() {
  return (
    <div className="w-full min-w-0">
      <div className="border-b border-border/50 bg-muted/15 px-0 py-3 md:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-7 w-44 rounded-lg md:h-8 md:w-56" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px border-b border-border/50 bg-border/60 p-px">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="bg-muted/40 px-1 py-2 text-center">
            <Skeleton className="mx-auto h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/50 p-px">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="min-h-22 bg-background p-1.5 md:min-h-30 md:p-2">
            <Skeleton className="h-4 w-6 rounded" />
            <Skeleton className="mt-2 h-6 w-full rounded-md" />
            <Skeleton className="mt-1 h-6 w-full rounded-md md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export type BranchBookingsCalendarProps = {
  bookings: BookingListItemDto[];
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  error: Error | null;
  onRefetch: () => void;
  onOpenDayList: (payload: { dateKey: string; bookings: BookingListItemDto[] }) => void;
};

export function BranchBookingsCalendar({
  bookings,
  isPending,
  isError,
  isFetching,
  error,
  onRefetch,
  onOpenDayList,
}: BranchBookingsCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  /** Làm mới “hôm nay” khi qua ngày / phút (đồng hồ thực). */
  const [clock, setClock] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setClock((c) => c + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const todayKey = useMemo(() => {
    void clock;
    return localDateKeyFromDate(new Date());
  }, [clock]);

  const byDay = useMemo(() => mapBookingsByLocalDay(bookings), [bookings]);

  const weeks = useMemo(() => buildMonthWeeks(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthBookingCount = useMemo(() => {
    let n = 0;
    for (const b of bookings) {
      const d = new Date(b.scheduledAt);
      if (Number.isNaN(d.getTime())) continue;
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) n += 1;
    }
    return n;
  }, [bookings, viewYear, viewMonth]);

  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
  };

  if (isPending) {
    return <BranchBookingsCalendarSkeleton />;
  }

  if (isError) {
    return (
      <div className="w-full min-w-0 rounded-lg border border-destructive/25 bg-destructive/6 p-4 text-sm md:p-5">
        <p className="text-destructive">{error?.message ?? "Không tải được danh sách lịch hẹn."}</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void onRefetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/10 px-0 py-3 sm:flex-row sm:items-center sm:justify-between md:py-3.5">
        <div className="min-w-0 px-3">
          <h3 className="truncate text-base font-semibold capitalize tracking-tight text-foreground md:text-lg">
            {monthTitleVi(viewYear, viewMonth)}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
            {monthBookingCount} lịch trong tháng
            {isFetching ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Đang cập nhật
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 px-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg border-border/70"
            aria-label="Tháng trước"
            onClick={goPrevMonth}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-9 rounded-lg text-xs sm:text-sm" onClick={goToday}>
            Hôm nay
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg border-border/70"
            aria-label="Tháng sau"
            onClick={goNextMonth}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid w-full grid-cols-7 gap-px border-b border-border/40 bg-border/50">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="bg-muted/30 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:py-2.5 md:text-xs"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-7 gap-px bg-border/45">
        {weeks.flat().map((day) => {
          const inMonth = day.getMonth() === viewMonth;
          const dateKey = localDateKeyFromDate(day);
          const isToday = dateKey === todayKey;
          const list = byDay.get(dateKey) ?? [];

          return (
            <div
              key={dateKey}
              className={cn(
                "flex min-h-26 flex-col border-b border-border/30 bg-background p-1 md:min-h-36 md:p-2",
                !inMonth && "bg-muted/20 text-muted-foreground",
              )}
            >
              <div className="mb-1 flex shrink-0 items-start justify-between gap-1">
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums md:size-7 md:text-xs",
                    isToday && "bg-primary text-primary-foreground shadow-sm",
                    !isToday && inMonth && "text-foreground",
                    !inMonth && "text-muted-foreground/80",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden pt-2">
                {list.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "group h-auto w-full flex-col gap-0.5 rounded-xl border border-primary/18 bg-primary/[0.07] py-2.5 text-xs font-medium text-foreground shadow-sm transition-[background-color,border-color,box-shadow,color] duration-200",
                      "hover:border-red-400/55 hover:bg-red-100/95 hover:text-foreground hover:shadow-none",
                      "dark:border-primary/25 dark:bg-primary/12 dark:hover:border-red-500/45 dark:hover:bg-red-950/45",
                      inMonth && "cursor-pointer",
                      !inMonth && "opacity-80",
                    )}
                    disabled={!inMonth}
                    onClick={() => inMonth && onOpenDayList({ dateKey, bookings: list })}
                  >
                    <span className="tabular-nums text-foreground">{list.length} lịch hẹn</span>
                    <span className="text-[10px] font-normal text-muted-foreground group-hover:text-muted-foreground">
                      Xem danh sách
                    </span>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
