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

const PURCHASE_MIN = dayjs("1990-01-01").startOf("day");

/** Ngày mua xe: nút hiển thị ngày + lịch mini (không dùng input date native). */
export function PurchaseDateField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const maxD = useMemo(() => dayjs().endOf("day"), []);
  const minD = PURCHASE_MIN;

  const [viewMonth, setViewMonth] = useState(() =>
    value ? dayjs(value).startOf("month") : dayjs().startOf("month"),
  );

  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      setViewMonth(dayjs(value).startOf("month"));
    }
  }, [value]);

  const display = value && dayjs(value).isValid() ? dayjs(value).format("D/M/YYYY") : "Chọn ngày mua";

  const handlePick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const canPrevMonth = !viewMonth.clone().subtract(1, "month").endOf("month").isBefore(minD, "day");
  const canNextMonth = !viewMonth.clone().add(1, "month").startOf("month").isAfter(maxD, "day");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
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
  );
}
