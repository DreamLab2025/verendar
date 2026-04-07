"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { ChevronLeft, ChevronRight } from "lucide-react";

dayjs.locale("vi");

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DOW_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function monthRangeForYear(
  year: number,
  minDayjs: dayjs.Dayjs,
  maxDayjs: dayjs.Dayjs,
): { start: number; end: number } {
  const minY = minDayjs.year();
  const maxY = maxDayjs.year();
  const start = year === minY ? minDayjs.month() : 0;
  const end = year === maxY ? maxDayjs.month() : 11;
  return { start, end };
}

export function MiniCalendarGrid({
  viewMonth,
  onViewMonthChange,
  selectedIso,
  onSelectDay,
  minDayjs,
  maxDayjs,
}: {
  viewMonth: dayjs.Dayjs;
  onViewMonthChange: (next: dayjs.Dayjs) => void;
  selectedIso: string;
  onSelectDay: (iso: string) => void;
  minDayjs: dayjs.Dayjs;
  maxDayjs: dayjs.Dayjs;
}) {
  const y = viewMonth.year();
  const m = viewMonth.month();

  const canPrevMonth = !viewMonth.clone().subtract(1, "month").endOf("month").isBefore(minDayjs, "day");
  const canNextMonth = !viewMonth.clone().add(1, "month").startOf("month").isAfter(maxDayjs, "day");

  const yearItems = useMemo(() => {
    const out: number[] = [];
    for (let year = minDayjs.year(); year <= maxDayjs.year(); year++) {
      out.push(year);
    }
    return out;
  }, [minDayjs, maxDayjs]);

  const monthItems = useMemo(() => {
    const { start, end } = monthRangeForYear(y, minDayjs, maxDayjs);
    const items: { value: string; label: string }[] = [];
    for (let i = start; i <= end; i++) {
      items.push({
        value: String(i),
        label: dayjs().year(y).month(i).locale("vi").format("MMMM"),
      });
    }
    return items;
  }, [y, minDayjs, maxDayjs]);

  const handleYearChange = (yearStr: string) => {
    const year = Number.parseInt(yearStr, 10);
    const { start, end } = monthRangeForYear(year, minDayjs, maxDayjs);
    let month = m;
    if (month < start) month = start;
    if (month > end) month = end;
    onViewMonthChange(viewMonth.clone().year(year).month(month).startOf("month"));
  };

  const handleMonthChange = (monthStr: string) => {
    const month = Number.parseInt(monthStr, 10);
    onViewMonthChange(viewMonth.clone().month(month).startOf("month"));
  };

  const first = viewMonth.startOf("month");
  const start = first.subtract(first.day(), "day");
  const cells: dayjs.Dayjs[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(start.add(i, "day"));
  }

  const todayIso = dayjs().format("YYYY-MM-DD");

  const selectContentClass =
    "z-[100] max-h-[min(50vh,280px)] rounded-xl border-border/60 bg-popover shadow-lg dark:border-border/50";

  return (
    <div className="w-[min(100vw-1.5rem,320px)] select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-2 py-2.5 dark:border-border/40 sm:gap-1.5 sm:px-3 sm:py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          disabled={!canPrevMonth}
          onClick={() => {
            if (canPrevMonth) onViewMonthChange(viewMonth.clone().subtract(1, "month"));
          }}
          aria-label="Tháng trước"
        >
          <ChevronLeft className="size-[18px]" strokeWidth={2} aria-hidden />
        </Button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2">
          <Select value={String(m)} onValueChange={handleMonthChange}>
            <SelectTrigger
              aria-label="Chọn tháng"
              className="h-9 max-w-[min(11rem,calc(100vw-8rem))] flex-1 rounded-xl border-border/60 bg-background/80 px-2 text-left text-[13px] font-semibold capitalize shadow-sm sm:text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className={selectContentClass}>
              {monthItems.map((item) => (
                <SelectItem key={item.value} value={item.value} className="capitalize">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(y)} onValueChange={handleYearChange}>
            <SelectTrigger
              aria-label="Chọn năm"
              className="h-9 w-[4.25rem] shrink-0 rounded-xl border-border/60 bg-background/80 px-2 text-[13px] font-semibold tabular-nums shadow-sm sm:w-[4.5rem] sm:text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className={selectContentClass}>
              {yearItems.map((year) => (
                <SelectItem key={year} value={String(year)} className="tabular-nums">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          disabled={!canNextMonth}
          onClick={() => {
            if (canNextMonth) onViewMonthChange(viewMonth.clone().add(1, "month"));
          }}
          aria-label="Tháng sau"
        >
          <ChevronRight className="size-[18px]" strokeWidth={2} aria-hidden />
        </Button>
      </div>

      <div className="px-2 pb-3 pt-2">
        <div className="grid grid-cols-7 gap-y-1">
          {DOW_VI.map((d) => (
            <div
              key={d}
              className="flex h-7 items-center justify-center text-[11px] font-medium tabular-nums text-muted-foreground/75"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="mt-0.5 grid grid-cols-7 gap-x-0 gap-y-1">
          {cells.map((d) => {
            const iso = d.format("YYYY-MM-DD");
            const inMonth = d.month() === viewMonth.month();
            const disabled = d.isBefore(minDayjs, "day") || d.isAfter(maxDayjs, "day");
            const sel = selectedIso === iso;
            const isToday = iso === todayIso;
            const weekend = d.day() === 0 || d.day() === 6;

            return (
              <div key={iso} className="flex h-9 items-center justify-center p-0.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) onSelectDay(iso);
                  }}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-[13px] font-medium tabular-nums transition-[color,background-color,box-shadow,transform] duration-150",
                    !inMonth && "text-muted-foreground/25",
                    disabled && "cursor-not-allowed opacity-25",
                    sel &&
                      "bg-primary text-primary-foreground shadow-md shadow-primary/25 dark:shadow-primary/15",
                    !sel &&
                      inMonth &&
                      !disabled &&
                      "text-foreground hover:bg-muted/90 active:scale-95 dark:hover:bg-muted/50",
                    !sel && inMonth && !disabled && weekend && "text-muted-foreground",
                    !sel &&
                      isToday &&
                      inMonth &&
                      !disabled &&
                      "ring-2 ring-primary/35 ring-offset-2 ring-offset-background dark:ring-offset-card",
                  )}
                >
                  {d.date()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
