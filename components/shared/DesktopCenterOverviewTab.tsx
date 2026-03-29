"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import type { VehicleReminder } from "@/lib/api/services/fetchTrackingReminder";
// import { MOCK_WEEKLY_ACTIVITY_KM } from "../desktopMock";
import { getReminderLevelConfig } from "@/lib/config/reminderLevelConfig";

function maskVin(vin: string) {
  if (!vin || vin.length < 8) return "••••••••";
  return `${vin.slice(0, 3)}${"•".repeat(Math.min(vin.length - 6, 12))}${vin.slice(-3)}`;
}

function RingGauge({ label, value, stroke }: { label: string; value: number; stroke: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={84} height={84} className="-rotate-90" aria-hidden>
        <circle
          cx={42}
          cy={42}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={7}
          className="text-neutral-200 dark:text-neutral-800"
        />
        <circle
          cx={42}
          cy={42}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={7}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="max-w-[88px] text-center text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">{Math.round(pct)}%</span>
    </div>
  );
}

type DesktopCenterOverviewTabProps = {
  vehicle: UserVehicle;
  declarationPercent: number;
  topReminders: VehicleReminder[];
  isLoadingReminders: boolean;
};

export function DesktopCenterOverviewTab({
  vehicle,
  declarationPercent,
  topReminders,
  isLoadingReminders,
}: DesktopCenterOverviewTabProps) {
  const model = vehicle.variant?.model;
  // const maxBarKm = useMemo(() => Math.max(...MOCK_WEEKLY_ACTIVITY_KM.map((d) => d.km), 1), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4"
    >
      {/* <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Hoạt động (mock — chưa có API)
        </p>
        <div className="flex h-32 items-end justify-between gap-1.5 border-b border-neutral-100 pb-1.5 dark:border-neutral-800 sm:h-36 sm:gap-2">
          {MOCK_WEEKLY_ACTIVITY_KM.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[28px] rounded-t-md bg-[#E22028] transition-all"
                style={{
                  height: `${(d.km / maxBarKm) * 100}%`,
                  minHeight: "8%",
                }}
                title={`${d.km} km`}
              />
              <span className="text-[10px] text-neutral-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div> */}

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Thông tin xe cá nhân
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:gap-x-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Hãng xe</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{model?.brandName ?? "—"}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Model</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{model?.name ?? "—"}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Nhiên liệu</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{model?.fuelTypeName ?? "—"}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Năm mua</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {vehicle.purchaseDate ? new Date(vehicle.purchaseDate).getFullYear() : "—"}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Hộp số</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{model?.transmissionTypeName ?? "—"}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Năm sản xuất</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{model?.releaseYear ?? "—"}</p>
          </div>
          <div className="col-span-2 flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Dung tích xi-lanh</span>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {model?.engineDisplacementDisplay ||
                (model?.engineCapacity != null ? `${model.engineCapacity} cc` : "—")}
            </p>
          </div>
          <div className="col-span-2 flex flex-col gap-0.5">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">Số khung / số máy</span>
            <p className="font-mono text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
              {maskVin(vehicle.vinNumber)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Tiến trình khai báo
          </h3>
          <span className="text-[13px] font-bold tabular-nums text-neutral-700 dark:text-neutral-300">
            {Math.round(declarationPercent)}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-[#E22028] transition-all"
            style={{ width: `${declarationPercent}%` }}
          />
        </div>
        <Link
          href={`/vehicle/${vehicle.id}`}
          className="inline-flex w-fit rounded-lg bg-[#E22028] px-3 py-2 text-[12px] font-semibold text-white hover:opacity-90"
        >
          Khai báo
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Nhắc nhớ nổi bật
        </h3>
        {isLoadingReminders ? (
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400">Đang tải…</p>
        ) : topReminders.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Chưa có nhắc nhở — khai báo phụ tùng để nhận nhắc nhở.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
            {topReminders.map((r) => {
              const cfg = getReminderLevelConfig(r.level);
              return (
                <RingGauge
                  key={r.id}
                  label={r.partCategory.name}
                  value={r.percentageRemaining}
                  stroke={cfg.hexColor}
                />
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-neutral-100 pt-3 text-[10px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {[
            ["#22c55e", "Tốt"],
            ["#3b82f6", "Khá"],
            ["#eab308", "TB"],
            ["#f97316", "Yếu"],
            ["#E22028", "Khẩn cấp"],
          ].map(([c, t]) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c }} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
