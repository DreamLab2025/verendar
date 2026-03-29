"use client";

import { motion } from "framer-motion";
import type { VehicleReminder } from "@/lib/api/services/fetchTrackingReminder";
import { getReminderLevelConfig } from "@/lib/config/reminderLevelConfig";

const panel = "rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800";
const labelMuted = "text-[12px] text-neutral-500 dark:text-neutral-400";

type DesktopCenterRemindersTabProps = {
  reminders: VehicleReminder[];
  isLoadingReminders: boolean;
};

export function DesktopCenterRemindersTab({ reminders, isLoadingReminders }: DesktopCenterRemindersTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`${panel} flex flex-col gap-2`}>
        {isLoadingReminders ? (
          <p className={labelMuted}>Đang tải…</p>
        ) : reminders.length === 0 ? (
          <p className={labelMuted}>Không có nhắc nhở.</p>
        ) : (
          reminders.map((r) => {
            const cfg = getReminderLevelConfig(r.level);
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/30"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.partCategory.name}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Còn ~{r.remainingKm?.toLocaleString("vi-VN") ?? "—"} km · {cfg.labelVi}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] font-bold text-neutral-700 dark:text-neutral-300">
                  {Math.round(r.percentageRemaining)}%
                </span>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
