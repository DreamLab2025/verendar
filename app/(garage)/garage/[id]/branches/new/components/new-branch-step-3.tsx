"use client";

import { Copy } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  CreateGarageBranchWorkingHoursPayload,
  GarageBranchDaySchedule,
  GarageBranchWorkingHoursDto,
} from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

/** Khóa ngày theo `Date.getDay()`: 0 = Chủ nhật, 1–6 = Thứ Hai → Thứ Bảy */
export type WorkingDayKey = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export const WORKING_DAY_ORDER: readonly { key: WorkingDayKey; label: string; short: string }[] = [
  { key: "1", label: "Thứ Hai", short: "T2" },
  { key: "2", label: "Thứ Ba", short: "T3" },
  { key: "3", label: "Thứ Tư", short: "T4" },
  { key: "4", label: "Thứ Năm", short: "T5" },
  { key: "5", label: "Thứ Sáu", short: "T6" },
  { key: "6", label: "Thứ Bảy", short: "T7" },
  { key: "0", label: "Chủ nhật", short: "CN" },
] as const;

export type NewBranchWorkingHoursDraft = Record<WorkingDayKey, GarageBranchDaySchedule>;

function defaultOpenDay(): GarageBranchDaySchedule {
  return { openTime: "08:00", closeTime: "18:00", isClosed: false };
}

function defaultClosedDay(): GarageBranchDaySchedule {
  return { openTime: "08:00", closeTime: "18:00", isClosed: true };
}

/** T2–T6 mở 8h–18h; T7, CN nghỉ (có thể chỉnh sau). */
export function createDefaultWorkingHoursDraft(): NewBranchWorkingHoursDraft {
  return {
    "1": defaultOpenDay(),
    "2": defaultOpenDay(),
    "3": defaultOpenDay(),
    "4": defaultOpenDay(),
    "5": defaultOpenDay(),
    "6": defaultClosedDay(),
    "0": defaultClosedDay(),
  };
}

export function workingHoursDraftToPayload(
  draft: NewBranchWorkingHoursDraft,
): CreateGarageBranchWorkingHoursPayload {
  const schedule: Record<string, GarageBranchDaySchedule> = {};
  for (const { key } of WORKING_DAY_ORDER) {
    schedule[key] = { ...draft[key] };
  }
  return { schedule };
}

/** Map `workingHours` từ GET chi nhánh → draft cùng shape với form wizard. */
export function workingHoursDetailToDraft(
  wh: GarageBranchWorkingHoursDto | null | undefined,
): NewBranchWorkingHoursDraft {
  const defaults = createDefaultWorkingHoursDraft();
  if (!wh?.schedule || typeof wh.schedule !== "object") return defaults;
  const out = { ...defaults };
  for (const { key } of WORKING_DAY_ORDER) {
    const raw = wh.schedule[key];
    if (raw && typeof raw === "object" && "openTime" in raw && "closeTime" in raw && "isClosed" in raw) {
      out[key] = {
        openTime: String((raw as GarageBranchDaySchedule).openTime),
        closeTime: String((raw as GarageBranchDaySchedule).closeTime),
        isClosed: Boolean((raw as GarageBranchDaySchedule).isClosed),
      };
    }
  }
  return out;
}

/** Trả về thông báo lỗi tiếng Việt hoặc null nếu hợp lệ. */
export function validateWorkingHoursDraft(draft: NewBranchWorkingHoursDraft): string | null {
  for (const { key, label } of WORKING_DAY_ORDER) {
    const d = draft[key];
    if (d.isClosed) continue;
    if (!d.openTime?.trim() || !d.closeTime?.trim()) {
      return `${label}: vui lòng chọn giờ mở và giờ đóng.`;
    }
    if (d.openTime >= d.closeTime) {
      return `${label}: giờ mở phải trước giờ đóng.`;
    }
  }
  return null;
}

export interface NewBranchStep3Props {
  schedule: NewBranchWorkingHoursDraft;
  onDayChange: (dayKey: WorkingDayKey, value: GarageBranchDaySchedule) => void;
}

export function NewBranchStep3({ schedule, onDayChange }: NewBranchStep3Props) {
  const applyMondayToAllOpen = useCallback(() => {
    const template = schedule["1"];
    for (const { key } of WORKING_DAY_ORDER) {
      const cur = schedule[key];
      if (cur.isClosed) continue;
      onDayChange(key, {
        openTime: template.openTime,
        closeTime: template.closeTime,
        isClosed: false,
      });
    }
  }, [schedule, onDayChange]);

  return (
    <section className="text-foreground" aria-labelledby="new-branch-step3-title">
      <header className="pb-6">
        <h2 id="new-branch-step3-title" className="mt-1 text-3xl font-semibold tracking-tight">
          Giờ làm việc
        </h2>
        <p className="text-sm text-muted-foreground">
          Thiết lập giờ mở/đóng từng ngày. Có thể đánh dấu ngày nghỉ — không gửi giờ khi đóng cửa.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs text-muted-foreground md:text-sm">
          Mẹo: chỉnh Thứ Hai rồi nhấn nút để copy giờ sang các ngày đang mở.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 self-start rounded-xl sm:self-auto"
          onClick={applyMondayToAllOpen}
        >
          <Copy className="size-4" aria-hidden />
          Giống Thứ Hai (các ngày mở)
        </Button>
      </div>

      <div className="mt-5 space-y-2 rounded-2xl border border-border/60 bg-card p-3 shadow-sm md:p-4">
        {/* Header row — desktop */}
        <div className="hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,7rem)_minmax(0,7rem)] gap-3 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <span>Ngày</span>
          <span className="text-center">Đóng cửa</span>
          <span>Mở</span>
          <span>Đóng</span>
        </div>

        <ul className="space-y-3 md:space-y-2">
          {WORKING_DAY_ORDER.map(({ key, label, short }) => {
            const day = schedule[key];
            const closed = day.isClosed;

            return (
              <li
                key={key}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border border-border/40 bg-background/80 p-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,7rem)_minmax(0,7rem)] md:items-center md:gap-3 md:border-0 md:bg-transparent md:p-0",
                  closed && "opacity-80",
                )}
              >
                <div className="flex items-center justify-between gap-3 md:contents">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{short}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 md:justify-center">
                    <Label htmlFor={`closed-${key}`} className="text-xs text-muted-foreground md:sr-only">
                      Đóng cửa
                    </Label>
                    <Switch
                      id={`closed-${key}`}
                      checked={closed}
                      onCheckedChange={(checked) =>
                        onDayChange(key, {
                          ...day,
                          isClosed: checked,
                        })
                      }
                      aria-label={closed ? `${label}: đóng cửa` : `${label}: mở cửa`}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    "grid grid-cols-2 gap-3 md:contents",
                    closed && "pointer-events-none opacity-40",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground md:sr-only">Mở cửa</span>
                    <input
                      type="time"
                      step={300}
                      value={day.openTime}
                      disabled={closed}
                      onChange={(e) =>
                        onDayChange(key, {
                          ...day,
                          openTime: e.target.value,
                        })
                      }
                      className={cn(
                        "h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-base font-medium text-foreground md:h-10 md:text-sm",
                        "disabled:cursor-not-allowed",
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground md:sr-only">Giờ đóng</span>
                    <input
                      type="time"
                      step={300}
                      value={day.closeTime}
                      disabled={closed}
                      onChange={(e) =>
                        onDayChange(key, {
                          ...day,
                          closeTime: e.target.value,
                        })
                      }
                      className={cn(
                        "h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-base font-medium text-foreground md:h-10 md:text-sm",
                        "disabled:cursor-not-allowed",
                      )}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
