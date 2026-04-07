"use client";

import dayjs from "dayjs";
import "dayjs/locale/vi";

import { MiniCalendarDateField } from "@/components/garage/mini-calendar-date-field";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

const PURCHASE_MIN = "1990-01-01";

/** Ngày mua xe: lịch mini (không dùng input date native). */
export function PurchaseDateField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  className?: string;
}) {
  return (
    <MiniCalendarDateField
      value={value}
      onChange={onChange}
      minDateStr={PURCHASE_MIN}
      emptyLabel="Chọn ngày mua"
      className={cn(className)}
    />
  );
}
