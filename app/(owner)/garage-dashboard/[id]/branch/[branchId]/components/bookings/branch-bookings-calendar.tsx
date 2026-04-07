"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/useMobile";
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
  const isMobile = useMobile();
  return (
    <div className="w-full min-w-0">
      <div className={cn("border-b border-border/50 bg-muted/15", isMobile ? "py-1.5" : "px-0 py-3 md:py-4")}>
        <div
          className={cn(
            "items-center justify-between",
            isMobile ? "flex flex-row gap-2 px-2" : "flex flex-wrap gap-3 px-3",
          )}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className={cn("rounded-lg", isMobile ? "h-5 w-40" : "h-7 w-44 md:h-8 md:w-56")} />
            <Skeleton className={cn("rounded", isMobile ? "h-3 w-28" : "h-4 w-36")} />
          </div>
          <div className={cn("flex shrink-0", isMobile ? "gap-0.5" : "gap-2")}>
            <Skeleton className={cn("rounded-lg", isMobile ? "h-9 w-9" : "h-9 w-9")} />
            <Skeleton className={cn("rounded-lg", isMobile ? "h-9 w-14" : "h-9 w-20")} />
            <Skeleton className={cn("rounded-lg", isMobile ? "h-9 w-9" : "h-9 w-9")} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px border-b border-border/50 bg-border/60 p-px">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className={cn("bg-muted/40 px-1 text-center", isMobile ? "py-1" : "py-2")}>
            <Skeleton className="mx-auto h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/50 p-px">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-background",
              isMobile ? "min-h-16 p-px" : "min-h-22 p-1.5 md:min-h-30 md:p-2",
            )}
          >
            <Skeleton className="h-4 w-6 rounded" />
            <Skeleton className="mt-2 h-6 w-full rounded-md" />
            <Skeleton className="mt-1 h-6 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export type BranchBookingsCalendarProps = {
  className?: string;
  bookings: BookingListItemDto[];
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  error: Error | null;
  onRefetch: () => void;
  onOpenDayList: (payload: { dateKey: string; bookings: BookingListItemDto[] }) => void;
};

export function BranchBookingsCalendar({
  className,
  bookings,
  isPending,
  isError,
  isFetching,
  error,
  onRefetch,
  onOpenDayList,
}: BranchBookingsCalendarProps) {
  const isMobile = useMobile();
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

  const weekRowCount = weeks.length;

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col",
        isMobile && "min-h-0 flex-1",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 border-b border-border/50 bg-muted/10",
          isMobile
            ? "flex-row items-center justify-between gap-2 px-2 py-1.5"
            : "flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between md:gap-3 md:py-3.5",
        )}
      >
        <div className={cn("min-w-0 flex-1", !isMobile && "px-3")}>
          <h3
            className={cn(
              "truncate font-semibold capitalize tracking-tight text-foreground",
              isMobile ? "text-sm leading-tight" : "text-base md:text-lg",
            )}
          >
            {monthTitleVi(viewYear, viewMonth)}
          </h3>
          <p
            className={cn(
              "text-muted-foreground",
              isMobile ? "mt-0.5 truncate text-[10px] leading-tight" : "mt-0.5 px-0 text-xs md:text-sm",
            )}
          >
            {monthBookingCount} lịch trong tháng
            {isFetching ? (
              <span className="ml-1.5 inline-flex items-center gap-0.5 sm:ml-2 sm:gap-1">
                <Loader2 className="size-3 shrink-0 animate-spin sm:size-3.5" aria-hidden />
                <span className="hidden sm:inline">Đang cập nhật</span>
              </span>
            ) : null}
          </p>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center",
            isMobile ? "gap-0.5 pr-0.5" : "flex-wrap px-3 sm:justify-end",
            !isMobile && "gap-1.5",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "shrink-0 rounded-lg border-border/70 touch-manipulation",
              isMobile ? "h-9 w-9" : "h-9 w-9",
            )}
            aria-label="Tháng trước"
            onClick={goPrevMonth}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn(
              "touch-manipulation",
              isMobile ? "h-9 shrink-0 rounded-lg px-2.5 text-[11px]" : "h-9 rounded-lg text-xs sm:text-sm",
            )}
            onClick={goToday}
          >
            Hôm nay
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "shrink-0 rounded-lg border-border/70 touch-manipulation",
              isMobile ? "h-9 w-9" : "h-9 w-9",
            )}
            aria-label="Tháng sau"
            onClick={goNextMonth}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid w-full shrink-0 grid-cols-7 gap-px border-b border-border/40 bg-border/50">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className={cn(
              "bg-muted/30 text-center font-semibold uppercase tracking-wide text-muted-foreground",
              isMobile ? "py-1 text-[9px]" : "py-2 text-[11px] md:py-2.5 md:text-xs",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        className={cn(
          "grid w-full min-h-0 flex-1 grid-cols-7 gap-px bg-border/45",
        )}
        style={
          isMobile
            ? { gridTemplateRows: `repeat(${weekRowCount}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {weeks.flat().map((day) => {
          const inMonth = day.getMonth() === viewMonth;
          const dateKey = localDateKeyFromDate(day);
          const isToday = dateKey === todayKey;
          const list = byDay.get(dateKey) ?? [];

          return (
            <div
              key={dateKey}
              className={cn(
                "flex min-h-0 min-w-0 flex-col border-b border-border/30 bg-background",
                isMobile ? "p-px" : "min-h-26 p-1 md:min-h-36 md:p-2",
                !inMonth && "bg-muted/20 text-muted-foreground",
              )}
            >
              <div className={cn("flex shrink-0 items-start justify-between gap-0.5", isMobile ? "mb-0" : "mb-1")}>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-md font-semibold tabular-nums",
                    isMobile ? "size-4 text-[9px]" : "size-6 text-[11px] md:size-7 md:text-xs",
                    isToday && "bg-primary text-primary-foreground shadow-sm",
                    !isToday && inMonth && "text-foreground",
                    !inMonth && "text-muted-foreground/80",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              <div
                className={cn(
                  "flex flex-col flex-1 justify-center",
                  isMobile ? " pt-0" : "gap-1 min-h-0 min-w-0 overflow-hidden",
                )}
              >
                {list.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "group h-auto w-full min-w-0 max-w-full flex-col justify-center rounded-lg border border-primary/18 bg-primary/[0.07] font-medium text-foreground shadow-sm transition-[background-color,border-color,box-shadow,color] duration-200 touch-manipulation",
                      isMobile
                        ? "gap-0 px-0.5 py-1 text-[9px] leading-tight"
                        : "gap-0.5 rounded-xl px-2 py-2.5 text-xs",
                      "hover:border-red-400/55 hover:bg-red-100/95 hover:text-foreground hover:shadow-none",
                      "dark:border-primary/25 dark:bg-primary/12 dark:hover:border-red-500/45 dark:hover:bg-red-950/45",
                      inMonth && "cursor-pointer",
                      !inMonth && "opacity-80",
                    )}
                    disabled={!inMonth}
                    onClick={() => inMonth && onOpenDayList({ dateKey, bookings: list })}
                  >
                    <span className="block w-full text-center tabular-nums text-foreground">
                      {list.length} lịch
                    </span>
                    <span
                      className={cn(
                        "block w-full text-center font-normal text-muted-foreground group-hover:text-muted-foreground",
                        isMobile ? "max-w-full text-[9px] leading-tight wrap-break-word" : "text-[10px]",
                      )}
                    >
                      {isMobile ? "Danh sách" : "Xem danh sách"}
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
