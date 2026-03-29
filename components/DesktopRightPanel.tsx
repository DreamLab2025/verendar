"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import type { MaintenanceRecordListItem } from "@/lib/api/services/fetchMaintenanceRecord";
import type { OdometerHistoryItem } from "@/lib/api/services/fetchOdometer";
import { OdometerHistorySection } from "@/components/common/OdometerHistorySection";
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineIconRail,
  TimelineItem,
  TimelineList,
  TimelineMeta,
  TimelineTitle,
  TimelineTrack,
} from "@/components/ui/timeline";
import { cn } from "@/lib/utils";

const BRAND = "#E22028";

function formatShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

type DesktopRightPanelProps = {
  vehicle: UserVehicle | null;
  maintenanceRecords: MaintenanceRecordListItem[];
  isLoadingMaintenance: boolean;
  odometerHistory: OdometerHistoryItem[];
  isLoadingOdometerHistory: boolean;
  /** Trang chi tiết xe / mobile: luôn hiện (không `hidden` dưới lg) */
  alwaysShow?: boolean;
};

export function DesktopRightPanel({
  vehicle,
  maintenanceRecords,
  isLoadingMaintenance,
  odometerHistory,
  isLoadingOdometerHistory,
  alwaysShow = false,
}: DesktopRightPanelProps) {
  const sortedRecords = useMemo(() => {
    return [...maintenanceRecords].sort(
      (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
    );
  }, [maintenanceRecords]);

  if (!vehicle) {
    return (
      <aside
        className={cn(
          "h-full min-h-0 shrink-0 border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30",
          alwaysShow ? "hidden" : "hidden w-[300px] border-l lg:block",
        )}
      />
    );
  }

  return (
    <aside
      className={cn(
        "min-h-0 shrink-0 flex-col gap-2 overflow-hidden max-lg:bg-transparent lg:bg-[#F9F8F6] dark:border-neutral-800 dark:lg:bg-neutral-900/30",
        alwaysShow
          ? "flex w-full max-h-[min(58dvh,520px)] border-t border-transparent pt-2 max-lg:bg-transparent dark:border-transparent lg:h-full lg:max-h-none lg:w-[min(360px,34%)] lg:shrink-0 lg:border-t-0 lg:border-l lg:border-neutral-200 lg:bg-[#F9F8F6] lg:pt-0 dark:lg:border-neutral-800"
          : "hidden h-full w-[18%] lg:flex",
      )}
    >
      {/* Trang home desktop: cột phải odo + bảo dưỡng. Trang `/vehicle/[id]`: gộp trong tab Lịch sử ở DesktopCenterPanel */}
      <OdometerHistorySection
        odometerHistory={odometerHistory}
        isLoadingOdometerHistory={isLoadingOdometerHistory}
        className={cn(
          "max-h-[55%] shrink-0 border-b border-neutral-200 dark:border-neutral-800",
          alwaysShow && "max-lg:hidden",
        )}
      />

      {/* —— Lịch sử bảo dưỡng (dưới) —— */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-xl backdrop-blur-sm dark:bg-background/80 lg:rounded-md lg:border lg:border-neutral-200 lg:bg-white lg:shadow-none lg:backdrop-blur-none dark:lg:border-neutral-800 dark:lg:bg-neutral-950">
        <div className="shrink-0 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-center gap-3">
                <ClipboardList className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Lịch sử bảo dưỡng
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5  px-2.5 py-1 text-[10px] font-medium text-neutral-600",
                    "dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300",
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-neutral-800 dark:bg-neutral-200" />
                  Phiếu
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium",
                    " text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200",
                  )}
                >
                  <span className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: BRAND }} />
                  Gần đây
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4">
          {isLoadingMaintenance ? (
            <div className="space-y-3 pl-1" aria-busy="true" aria-label="Đang tải lịch sử">
              {[0, 1, 2].map((k) => (
                <div key={k} className="flex gap-3">
                  <div className="flex w-4 justify-center pt-1">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                  <div className="h-16 flex-1 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
                </div>
              ))}
            </div>
          ) : sortedRecords.length === 0 ? (
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">Chưa có lịch sử bảo dưỡng.</p>
          ) : (
            <Timeline className="pl-0.5">
              <TimelineTrack />
              <TimelineList>
                {sortedRecords.slice(0, 8).map((rec, i) => {
                  const recent = i < 2;
                  return (
                    <TimelineItem key={rec.id}>
                      <TimelineIconRail>
                        <TimelineDot
                          className={cn(!recent && "bg-neutral-800 dark:bg-neutral-200")}
                          style={recent ? { backgroundColor: BRAND, borderColor: "white" } : undefined}
                        />
                      </TimelineIconRail>
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                        className="min-w-0 flex-1"
                      >
                        <TimelineContent className="transition-shadow hover:shadow-md dark:hover:shadow-none">
                          <TimelineTitle>Phiếu bảo dưỡng · {rec.itemCount} mục</TimelineTitle>
                          <TimelineDescription>
                            {formatShort(rec.serviceDate)} · {rec.odometerAtService.toLocaleString("vi-VN")} km
                          </TimelineDescription>
                          {rec.garageName ? <TimelineMeta>{rec.garageName}</TimelineMeta> : null}
                        </TimelineContent>
                      </motion.div>
                    </TimelineItem>
                  );
                })}
              </TimelineList>
            </Timeline>
          )}
        </div>
      </div>
    </aside>
  );
}
