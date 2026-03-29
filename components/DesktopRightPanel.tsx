"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Gauge } from "lucide-react";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import type { MaintenanceRecordListItem } from "@/lib/api/services/fetchMaintenanceRecord";
import type { OdometerHistoryItem } from "@/lib/api/services/fetchOdometer";
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
import { Separator } from "@/components/ui/separator";

const BRAND = "#E22028";

function formatShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function isManualOdometer(row: OdometerHistoryItem) {
  return row.source === "ManualInput";
}

type DesktopRightPanelProps = {
  vehicle: UserVehicle | null;
  maintenanceRecords: MaintenanceRecordListItem[];
  isLoadingMaintenance: boolean;
  odometerHistory: OdometerHistoryItem[];
  isLoadingOdometerHistory: boolean;
};

export function DesktopRightPanel({
  vehicle,
  maintenanceRecords,
  isLoadingMaintenance,
  odometerHistory,
  isLoadingOdometerHistory,
}: DesktopRightPanelProps) {
  const odoListScrollRef = useRef<HTMLDivElement>(null);

  const sortedRecords = useMemo(() => {
    return [...maintenanceRecords].sort(
      (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
    );
  }, [maintenanceRecords]);

  const sortedOdo = useMemo(() => {
    return [...odometerHistory].sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
  }, [odometerHistory]);

  /** Cuộn xuống đáy (mốc mới nhất hiển thị phía dưới, không kẹt ở đầu). Lặp sau layout + sau Framer Motion. */
  useLayoutEffect(() => {
    if (isLoadingOdometerHistory || sortedOdo.length === 0) return;
    const el = odoListScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [isLoadingOdometerHistory, sortedOdo, vehicle?.id]);

  useEffect(() => {
    if (isLoadingOdometerHistory || sortedOdo.length === 0) return;
    const t = window.setTimeout(() => {
      const el = odoListScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 450);
    return () => window.clearTimeout(t);
  }, [isLoadingOdometerHistory, sortedOdo, vehicle?.id]);

  if (!vehicle) {
    return (
      <aside className="hidden h-full min-h-0 w-[300px] shrink-0 border-l border-neutral-200 bg-neutral-50/50 lg:block dark:border-neutral-800 dark:bg-neutral-900/30" />
    );
  }

  return (
    <aside className="hidden h-full min-h-0 w-[18%] shrink-0 flex-col gap-2 overflow-hidden bg-[#F9F8F6] lg:flex dark:border-neutral-800 dark:bg-neutral-900/30">
      {/* —— Lịch sử cập nhật odo (trên): tự động trái | trục giữa | thủ công phải —— */}
      <div className="flex bg-white rounded-md max-h-[55%] shrink-0 flex-col border-b border-neutral-200 dark:border-neutral-800">
        <div className="shrink-0 p-4 pb-3">
          <div className="flex items-center justify-center gap-3">
            <Gauge className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-[14px]  font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Lịch sử cập nhật odo
            </h3>
          </div>
        </div>

        <div
          ref={odoListScrollRef}
          className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-4"
        >
          {isLoadingOdometerHistory ? (
            <div className="space-y-3" aria-busy="true" aria-label="Đang tải lịch sử odo">
              {[0, 1, 2].map((k) => (
                <div key={k} className="grid grid-cols-[1fr_20px_1fr] gap-2">
                  <div className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
                  <div className="flex justify-center pt-2">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                  <div className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
                </div>
              ))}
            </div>
          ) : sortedOdo.length === 0 ? (
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">Chưa có bản ghi cập nhật odo.</p>
          ) : (
            <div className="relative">
              <div
                className="pointer-events-none absolute bottom-6 left-1/2 top-2 -translate-x-1/2 border-l border-dashed border-neutral-300 dark:border-neutral-700"
                aria-hidden
              />
              <ul className="relative m-0 list-none space-y-0 p-0">
                {sortedOdo
                  .slice(0, 10)
                  .reverse()
                  .map((row, i) => {
                    const manual = isManualOdometer(row);
                    return (
                      <li
                        key={row.id}
                        className="group/odo relative grid grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)] gap-x-2 gap-y-0 pb-5 last:pb-0"
                      >
                        <div className={cn("min-w-0", manual ? "invisible pointer-events-none select-none" : "")}>
                          {!manual && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                              className="ml-0 flex justify-end"
                            >
                              <div className={cn("w-full max-w-[200px]  p-2.5 text-right shadow-sm")}>
                                <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                                  {row.odometerValue.toLocaleString("vi-VN")} km
                                </p>
                                <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                  {formatShort(row.recordedDate)}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="relative z-1 flex flex-col items-center pt-2">
                          <span
                            className={cn(
                              "h-7 w-7 shrink-0 rounded-full border-2 border-white shadow-sm ring-1 dark:border-neutral-950",
                              manual
                                ? "ring-red-200/50 dark:ring-red-900/40"
                                : row.source === "Scan"
                                  ? "bg-violet-500 ring-violet-200/70 dark:ring-violet-900/40"
                                  : "bg-neutral-900 ring-neutral-300/70 dark:bg-neutral-100 dark:ring-neutral-600",
                            )}
                            style={manual ? { backgroundColor: BRAND, borderColor: "white" } : undefined}
                            aria-hidden
                          />
                        </div>

                        <div className={cn("min-w-0", !manual ? "invisible pointer-events-none select-none" : "")}>
                          {manual && (
                            <motion.div
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                              className="flex justify-start"
                            >
                              <div className={cn("w-full max-w-[200px]  p-2.5 text-left shadow-sm")}>
                                <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                                  {row.odometerValue.toLocaleString("vi-VN")} km
                                </p>
                                <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                  {formatShort(row.recordedDate)}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>

        <Separator className="mt-4 h-px w-full self-center bg-neutral-200 dark:bg-neutral-700" />
        <h3 className="text-[13px] font-bold w-full text-center text-[#80868E] dark:text-[#80868E] py-2">Ghi chú</h3>
        <div
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2  pb-4 "
          role="note"
          aria-label="Ghi chú màu trên timeline odo"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-4 shrink-0 rounded-full bg-neutral-900 dark:bg-neutral-100" aria-hidden />
            <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">:</span>
            <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">Tự Động</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: BRAND }} aria-hidden />
            <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">:</span>
            <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">Thủ Công</span>
          </span>
        </div>
      </div>

      {/* —— Lịch sử bảo dưỡng (dưới) —— */}
      <div className="flex bg-white rounded-md min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
