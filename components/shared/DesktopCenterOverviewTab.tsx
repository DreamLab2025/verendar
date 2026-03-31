"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ClipboardList, Sparkles } from "lucide-react";

import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import type { VehicleReminder } from "@/lib/api/services/fetchTrackingReminder";
import { getLevelBadgeClasses, getReminderLevelConfig } from "@/lib/config/reminderLevelConfig";
import { cn } from "@/lib/utils";

const BRAND = "#E22028";
const easeUi = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: easeUi } },
};

const LEGEND_LEVELS = ["Normal", "Low", "Medium", "High", "Critical"] as const;

function SectionLabel({ kicker, title, hint }: { kicker: string; title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">{kicker}</p>
      <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h3>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">{hint}</p> : null}
    </div>
  );
}

function Hairline() {
  return <div className="h-px w-full bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" aria-hidden />;
}

function SpecRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2.5">
      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="max-w-[min(100%,16rem)] text-right text-[12px] font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
    </div>
  );
}

function maskVin(vin: string) {
  if (!vin || vin.length < 8) return "••••••••";
  return `${vin.slice(0, 3)}${"•".repeat(Math.min(vin.length - 6, 12))}${vin.slice(-3)}`;
}

function RingGauge({ label, value, stroke }: { label: string; value: number; stroke: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={72} height={72} className="-rotate-90" aria-hidden>
        <circle cx={36} cy={36} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-neutral-200 dark:text-neutral-800" />
        <circle
          cx={36}
          cy={36}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={5}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="line-clamp-2 max-w-[92px] text-center text-[9px] font-medium leading-tight text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-[12px] font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{Math.round(pct)}%</span>
    </div>
  );
}

function OverviewReminderHighlight({ r }: { r: VehicleReminder }) {
  const cfg = getReminderLevelConfig(r.level);
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-between gap-3 px-1 py-2 text-center sm:px-3">
      {r.partCategory.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={r.partCategory.iconUrl}
          alt=""
          className="size-11 shrink-0 rounded-xl object-contain opacity-95 ring-1 ring-neutral-200/60 dark:opacity-100 dark:ring-neutral-700/80"
        />
      ) : (
        <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-100/90 ring-1 ring-neutral-200/50 dark:bg-neutral-800/80 dark:ring-neutral-700/60">
          <Sparkles className="size-5 text-neutral-400" aria-hidden />
        </div>
      )}
      <RingGauge label={r.partCategory.name} value={r.percentageRemaining} stroke={cfg.hexColor} />
      <span className={cn("rounded-full border px-2.5 py-0.5 text-[9px] font-semibold", getLevelBadgeClasses(r.level))}>{cfg.labelVi}</span>
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
  const pct = Math.min(100, Math.max(0, declarationPercent));

  const specRows: { label: string; value: ReactNode }[] = [
    { label: "Hãng xe", value: model?.brandName ?? "—" },
    { label: "Model", value: model?.name ?? "—" },
    { label: "Nhiên liệu", value: model?.fuelTypeName ?? "—" },
    { label: "Năm mua", value: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).getFullYear() : "—" },
    { label: "Hộp số", value: model?.transmissionTypeName ?? "—" },
    { label: "Năm sản xuất", value: model?.releaseYear ?? "—" },
    {
      label: "Dung tích xi-lanh",
      value: model?.engineDisplacementDisplay || (model?.engineCapacity != null ? `${model.engineCapacity} cc` : "—"),
    },
    { label: "Số khung / số máy", value: <span className="font-mono text-[12px]">{maskVin(vehicle.vinNumber)}</span> },
  ];

  const purchaseYear = vehicle.purchaseDate ? new Date(vehicle.purchaseDate).getFullYear() : null;
  const headline = [model?.brandName, model?.name].filter(Boolean).join(" ") || "Xe của bạn";
  const subline = [purchaseYear ? `Mua ${purchaseYear}` : null, model?.releaseYear ? `SX ${model.releaseYear}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
      {/* Nhận diện xe + thông số — bento nhẹ, không card dày */}
      <motion.section variants={item} className="pb-6">
        <div className="relative overflow-hidden rounded-xl border border-neutral-200/70 bg-linear-to-br from-[#F9F8F6] to-neutral-100/40 px-4 py-4 dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900/80">
          <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[#E22028]/[0.07] blur-2xl dark:bg-[#E22028]/10" aria-hidden />
          <div className="relative border-l-2 border-[#E22028] pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">Xe đang chọn</p>
            <p className="mt-1 text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50">{headline}</p>
            {subline ? <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">{subline}</p> : null}
          </div>
        </div>

        <div className="mt-5">
          <SectionLabel kicker="Hồ sơ" title="Thông số kỹ thuật" hint="Dữ liệu đã lưu trên tài khoản của bạn." />
          {(() => {
            const mid = Math.ceil(specRows.length / 2);
            const left = specRows.slice(0, mid);
            const right = specRows.slice(mid);
            return (
              <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 md:gap-y-0">
                <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
                  {left.map((row) => (
                    <SpecRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
                <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
                  {right.map((row) => (
                    <SpecRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </motion.section>

      <Hairline />

      {/* Khai báo — một dòng trạng thái + thanh mỏng, tránh card “template” */}
      <motion.section variants={item} className="py-6">
        <SectionLabel kicker="Tiến độ" title="Khai báo phụ tùng" hint="Tỷ lệ phụ tùng đã khai báo trên xe." />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <p className="flex min-w-0 items-center gap-2 text-[13px] text-neutral-700 dark:text-neutral-200">
              <ClipboardList className="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" strokeWidth={2} aria-hidden />
              <span className="tabular-nums">
                <span className="text-[22px] font-semibold leading-none text-neutral-950 dark:text-neutral-50">{Math.round(pct)}%</span>
                <span className="ml-1.5 text-[12px] font-normal text-neutral-500 dark:text-neutral-400">đã khai báo</span>
              </span>
            </p>
            <Link
              href={`/vehicle/${vehicle.id}`}
              className="group inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-[#E22028] underline-offset-4 hover:underline dark:text-red-400 dark:hover:text-red-300"
            >
              Bổ sung khai báo
              <ChevronRight className="size-3.5 opacity-80 transition-transform group-hover:translate-x-px" aria-hidden />
            </Link>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: BRAND }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.55, ease: easeUi }}
            />
          </div>
        </div>
      </motion.section>

      <Hairline />

      {/* Nhắc nổi bật — 3 cột có vách nhẹ */}
      <motion.section variants={item} className="pt-6">
        <SectionLabel
          kicker="Ưu tiên"
          title="Nhắc nhớ nổi bật"
          hint="Theo mức độ — chi tiết đầy đủ trong tab Nhắc nhở."
        />

        {isLoadingReminders ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-44 animate-pulse rounded-lg bg-neutral-100/70 dark:bg-neutral-900/45",
                  i > 0 && "sm:border-l sm:border-neutral-200/80 sm:pl-4 dark:sm:border-neutral-800",
                )}
              />
            ))}
          </div>
        ) : topReminders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-200/90 px-4 py-6 text-center text-[13px] leading-relaxed text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Chưa có nhắc nhở — khai báo phụ tùng để nhận nhắc thay thế đúng lúc.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-neutral-200/80 dark:sm:divide-neutral-800">
            {topReminders.map((r) => (
              <OverviewReminderHighlight key={r.id} r={r} />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-2 rounded-lg bg-neutral-50/90 px-3 py-2.5 dark:bg-neutral-900/50">
          {LEGEND_LEVELS.map((level) => {
            const cfg = getReminderLevelConfig(level);
            return (
              <span key={level} className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-2 py-0.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                <span className="h-2 w-2 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: cfg.hexColor }} />
                {cfg.labelVi}
              </span>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
