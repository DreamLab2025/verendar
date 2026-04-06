"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { motion } from "framer-motion";
import { CalendarRange } from "lucide-react";

import { MiniCalendarGrid } from "@/components/garage/mini-calendar-grid";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

type GarageBookingDateFieldProps = {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  minDate: string;
  labelId?: string;
};

/** Ngày đặt lịch: thanh ngày cuộn ngang + lịch mini trong popover. */
export function GarageBookingDateField({ value, onChange, minDate, labelId }: GarageBookingDateFieldProps) {
  const [open, setOpen] = useState(false);
  const minD = useMemo(() => dayjs(minDate).startOf("day"), [minDate]);
  const maxD = useMemo(() => minD.add(365, "day"), [minD]);

  const [viewMonth, setViewMonth] = useState(() => dayjs(value || minDate).startOf("month"));

  /** 14 ngày = 2 hàng × 7 cột trên desktop — không cần cuộn ngang. */
  const stripDays = useMemo(() => {
    const out: dayjs.Dayjs[] = [];
    for (let i = 0; i < 14; i++) {
      const d = minD.add(i, "day");
      if (d.isAfter(maxD, "day")) break;
      out.push(d);
    }
    return out;
  }, [minD, maxD]);

  const summary = value && dayjs(value).isValid() ? dayjs(value).format("dddd, D MMMM YYYY") : null;

  const handlePick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const canPrevMonth = !viewMonth.clone().subtract(1, "month").endOf("month").isBefore(minD, "day");
  const canNextMonth = !viewMonth.clone().add(1, "month").startOf("month").isAfter(maxD, "day");

  return (
    <div className="min-w-0 w-full space-y-2 sm:space-y-3">
      {summary ? (
        <div className="rounded-lg border border-border/40 bg-muted/20 px-2.5 py-2 dark:border-border/50 dark:bg-muted/15 sm:rounded-xl sm:px-3 sm:py-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
            Ngày đã chọn
          </p>
          <p className="mt-0.5 text-xs font-semibold capitalize leading-snug tracking-tight text-foreground sm:text-sm">
            {summary}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground sm:text-sm">Chọn ngày đến garage.</p>
      )}

      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:mb-1.5 sm:text-[11px]">
          14 ngày tới
        </p>
        <div
          className={cn(
            "max-w-full",
            "flex gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 pt-0.5 [scrollbar-width:thin] snap-x snap-mandatory",
            "sm:grid sm:grid-cols-7 sm:gap-1.5 sm:overflow-visible sm:pb-0 sm:snap-none",
          )}
          role="listbox"
          aria-labelledby={labelId}
          aria-label="Chọn nhanh ngày"
        >
          {stripDays.map((d) => {
            const iso = d.format("YYYY-MM-DD");
            const selected = value === iso;
            const isToday = d.isSame(dayjs(), "day");
            return (
              <motion.button
                key={iso}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onChange(iso)}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15, ease: easeOut }}
                className={cn(
                  "snap-start shrink-0 rounded-lg px-2 py-1.5 text-center transition-shadow sm:rounded-xl",
                  "min-w-[2.85rem] max-sm:min-w-[2.85rem]",
                  "sm:min-w-0 sm:w-full sm:px-1.5 sm:py-1.5",
                  selected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                    : "border border-border/50 bg-background/90 shadow-sm hover:border-primary/30 hover:bg-muted/30 dark:border-border/40 dark:bg-card/50",
                )}
              >
                <span
                  className={cn(
                    "block text-[9px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px]",
                    selected ? "text-primary-foreground/90" : "text-muted-foreground",
                  )}
                >
                  {isToday ? (
                    <>
                      <span className="sm:hidden">Nay</span>
                      <span className="hidden sm:inline">Hôm nay</span>
                    </>
                  ) : (
                    d.format("ddd")
                  )}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs font-bold tabular-nums leading-none sm:text-[13px]",
                    selected ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {d.format("D/M")}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next && value) setViewMonth(dayjs(value).startOf("month"));
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg border-border/60 bg-muted/15 text-xs font-medium text-foreground hover:bg-muted/30 dark:border-border/50 dark:bg-muted/10 sm:h-9 sm:text-sm"
          >
            <CalendarRange className="size-4 shrink-0 opacity-80" aria-hidden />
            Mở lịch tháng
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl dark:border-border/50 dark:shadow-black/40"
        >
          <MiniCalendarGrid
            viewMonth={viewMonth}
            onPrevMonth={() => {
              if (canPrevMonth) setViewMonth((m) => m.clone().subtract(1, "month"));
            }}
            onNextMonth={() => {
              if (canNextMonth) setViewMonth((m) => m.clone().add(1, "month"));
            }}
            selectedIso={value}
            onSelectDay={handlePick}
            minDayjs={minD}
            maxDayjs={maxD}
            disablePrev={!canPrevMonth}
            disableNext={!canNextMonth}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
