"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { CalendarDays } from "lucide-react";

import { MiniCalendarGrid } from "@/components/garage/mini-calendar-grid";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

export type MiniCalendarDateFieldProps = {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  className?: string;
  /** ISO yyyy-mm-dd — mặc định 1920-01-01 */
  minDateStr?: string;
  /** ISO yyyy-mm-dd — mặc định hôm nay */
  maxDateStr?: string;
  emptyLabel?: string;
  /** Gắn `Label htmlFor` */
  id?: string;
};

/** Lịch mini + Popover (cùng cấu hình AWS Location / MiniCalendarGrid với phần garage). */
export function MiniCalendarDateField({
  value,
  onChange,
  className,
  minDateStr = "1920-01-01",
  maxDateStr,
  emptyLabel = "Chọn ngày",
  id,
}: MiniCalendarDateFieldProps) {
  const [open, setOpen] = useState(false);
  const maxD = useMemo(
    () => (maxDateStr ? dayjs(maxDateStr).endOf("day") : dayjs().endOf("day")),
    [maxDateStr],
  );
  const minD = useMemo(() => dayjs(minDateStr).startOf("day"), [minDateStr]);

  const [viewMonth, setViewMonth] = useState(() =>
    value && dayjs(value).isValid() ? dayjs(value).startOf("month") : dayjs().startOf("month"),
  );

  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      queueMicrotask(() => {
        setViewMonth(dayjs(value).startOf("month"));
      });
    }
  }, [value]);

  const display =
    value && dayjs(value).isValid() ? dayjs(value).format("D/M/YYYY") : emptyLabel;

  const handlePick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-start gap-2 rounded-xl border-input font-normal text-foreground",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 opacity-70" aria-hidden />
          {display}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto overflow-hidden rounded-2xl border-border/60 p-0 shadow-xl dark:border-border/50 dark:shadow-black/40"
      >
        <MiniCalendarGrid
          viewMonth={viewMonth}
          onViewMonthChange={setViewMonth}
          selectedIso={value}
          onSelectDay={handlePick}
          minDayjs={minD}
          maxDayjs={maxD}
        />
      </PopoverContent>
    </Popover>
  );
}
