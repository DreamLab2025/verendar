"use client";

import { Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GarageBranchDaySchedule, GarageBranchWorkingHoursDto } from "@/lib/api/services/fetchGarage";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const DAY_LABEL_VI: Record<string, string> = {
  Monday: "Thứ hai",
  Tuesday: "Thứ ba",
  Wednesday: "Thứ tư",
  Thursday: "Thứ năm",
  Friday: "Thứ sáu",
  Saturday: "Thứ bảy",
  Sunday: "Chủ nhật",
  "0": "Chủ nhật",
  "1": "Thứ hai",
  "2": "Thứ ba",
  "3": "Thứ tư",
  "4": "Thứ năm",
  "5": "Thứ sáu",
  "6": "Thứ bảy",
};

function canonicalDayKey(key: string): string | null {
  const lower = key.trim().toLowerCase();
  for (const d of DAY_ORDER) {
    if (d.toLowerCase() === lower) return d;
  }
  return null;
}

function labelForDayKey(key: string): string {
  const canon = canonicalDayKey(key);
  if (canon && DAY_LABEL_VI[canon]) return DAY_LABEL_VI[canon];
  return DAY_LABEL_VI[key] ?? key;
}

function sortScheduleKeys(keys: string[]): string[] {
  const score = (k: string) => {
    const canon = canonicalDayKey(k);
    if (canon !== null) return DAY_ORDER.indexOf(canon as (typeof DAY_ORDER)[number]);
    return 100;
  };
  return [...keys].sort((a, b) => score(a) - score(b) || a.localeCompare(b, "vi"));
}

function formatSlot(day: GarageBranchDaySchedule): string {
  if (day.isClosed) return "Đóng cửa";
  const o = day.openTime?.trim() || "—";
  const c = day.closeTime?.trim() || "—";
  return `${o} – ${c}`;
}

type BranchWorkingHoursCardProps = {
  workingHours: GarageBranchWorkingHoursDto | null | undefined;
  isMobile: boolean;
};

export function BranchWorkingHoursCard({ workingHours, isMobile }: BranchWorkingHoursCardProps) {
  const schedule = workingHours?.schedule;
  const keys = schedule && typeof schedule === "object" ? Object.keys(schedule) : [];
  const sortedKeys = sortScheduleKeys(keys);

  const pad = isMobile ? "p-4" : "p-5 sm:p-7";
  const bodyPad = isMobile ? "px-4 pb-5 pt-4" : "px-5 pb-6 pt-5 sm:px-7 sm:pb-7";

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <div className={cn("border-b border-border/60", pad)}>
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground sm:size-6" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Giờ làm việc</h3>
          </div>
        </div>
      </div>
      <div className={bodyPad}>
        {sortedKeys.length === 0 ? (
          <p className="text-base text-muted-foreground">Chưa cấu hình giờ làm việc.</p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {sortedKeys.map((key) => {
              const day = schedule![key];
              if (!day) return null;
              return (
                <li
                  key={key}
                  className={cn(
                    "flex gap-1 px-3 py-3.5 sm:px-4 sm:py-4",
                    isMobile
                      ? "flex-col"
                      : "flex-row items-center justify-between gap-4",
                  )}
                >
                  <span className="text-sm font-medium text-foreground sm:text-base">{labelForDayKey(key)}</span>
                  <span className="text-sm text-muted-foreground tabular-nums sm:text-base">{formatSlot(day)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
