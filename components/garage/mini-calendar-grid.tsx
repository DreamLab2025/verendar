"use client";

import dayjs from "dayjs";
import "dayjs/locale/vi";
import { ChevronLeft, ChevronRight } from "lucide-react";

dayjs.locale("vi");

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOW_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function MiniCalendarGrid({
  viewMonth,
  onPrevMonth,
  onNextMonth,
  selectedIso,
  onSelectDay,
  minDayjs,
  maxDayjs,
  disablePrev,
  disableNext,
}: {
  viewMonth: dayjs.Dayjs;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedIso: string;
  onSelectDay: (iso: string) => void;
  minDayjs: dayjs.Dayjs;
  maxDayjs: dayjs.Dayjs;
  disablePrev?: boolean;
  disableNext?: boolean;
}) {
  const first = viewMonth.startOf("month");
  const start = first.subtract(first.day(), "day");
  const cells: dayjs.Dayjs[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(start.add(i, "day"));
  }

  const todayIso = dayjs().format("YYYY-MM-DD");

  return (
    <div className="w-[min(100vw-1.5rem,304px)] select-none">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-3 dark:border-border/40">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          disabled={disablePrev}
          onClick={onPrevMonth}
        >
          <ChevronLeft className="size-[18px]" strokeWidth={2} aria-hidden />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[15px] font-semibold capitalize leading-tight tracking-tight text-foreground">
            {viewMonth.locale("vi").format("MMMM")}
          </p>
          <p className="mt-0.5 text-xs font-medium tabular-nums text-muted-foreground">{viewMonth.format("YYYY")}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          disabled={disableNext}
          onClick={onNextMonth}
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

        <div className="mt-0.5 grid grid-cols-7 gap-y-1 gap-x-0">
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
                    !sel && isToday && inMonth && !disabled && "ring-2 ring-primary/35 ring-offset-2 ring-offset-background dark:ring-offset-card",
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
