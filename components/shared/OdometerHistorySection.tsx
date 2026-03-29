"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import type { OdometerHistoryItem } from "@/lib/api/services/fetchOdometer";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

export type OdometerHistorySectionProps = {
  odometerHistory: OdometerHistoryItem[];
  isLoadingOdometerHistory: boolean;
  className?: string;
  /** Vùng danh sách cuộn (thêm min-h-0 khi nằm trong flex tab) */
  listClassName?: string;
};

export function OdometerHistorySection({
  odometerHistory,
  isLoadingOdometerHistory,
  className,
  listClassName,
}: OdometerHistorySectionProps) {
  const odoListScrollRef = useRef<HTMLDivElement>(null);

  const sortedOdo = useMemo(() => {
    return [...odometerHistory].sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
  }, [odometerHistory]);

  useLayoutEffect(() => {
    if (isLoadingOdometerHistory || sortedOdo.length === 0) return;
    const el = odoListScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [isLoadingOdometerHistory, sortedOdo]);

  useEffect(() => {
    if (isLoadingOdometerHistory || sortedOdo.length === 0) return;
    const t = window.setTimeout(() => {
      const el = odoListScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 450);
    return () => window.clearTimeout(t);
  }, [isLoadingOdometerHistory, sortedOdo]);

  return (
    <div className={cn("flex min-h-0 flex-col rounded-md border border-border/60 bg-card text-card-foreground dark:border-border/50", className)}>
      <div className="shrink-0 p-4 pb-3">
        <div className="flex items-center justify-center gap-3">
          <Gauge className="h-4 w-4 text-neutral-700 dark:text-neutral-300" aria-hidden />
          <h3 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Lịch sử cập nhật odo
          </h3>
        </div>
      </div>

      <div
        ref={odoListScrollRef}
        className={cn(
          "scrollbar-hide flex min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-4",
          listClassName,
        )}
      >
        {isLoadingOdometerHistory ? (
          <div className="w-full max-w-[300px] space-y-3" aria-busy="true" aria-label="Đang tải lịch sử odo">
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
          <p className="w-full text-center text-[12px] text-neutral-500 dark:text-neutral-400">
            Chưa có bản ghi cập nhật odo.
          </p>
        ) : (
          <div className="relative w-full max-w-[300px]">
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
                            <div className="w-full max-w-[200px] p-2.5 text-right shadow-sm">
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
                            <div className="w-full max-w-[200px] p-2.5 text-left shadow-sm">
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
      <h3 className="w-full py-2 text-center text-[13px] font-bold text-[#80868E] dark:text-[#80868E]">Ghi chú</h3>
      <div
        className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 pb-4"
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
  );
}
