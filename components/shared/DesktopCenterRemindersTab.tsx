"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

import type { VehicleReminder } from "@/lib/api/services/fetchTrackingReminder";
import { getReminderLevelConfig, getLevelBadgeClasses } from "@/lib/config/reminderLevelConfig";
import { cn } from "@/lib/utils";

const labelMuted = "text-[12px] text-neutral-500 dark:text-neutral-400";
const BRAND = "#E22028";
const easeUi = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: easeUi } },
};

function SectionLabel({ kicker, title, hint }: { kicker: string; title: string; hint?: string }) {
  return (
    <div className="mb-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
        {kicker}
      </p>
      <h3 className="mt-0.5 text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      {hint ? <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">{hint}</p> : null}
    </div>
  );
}

function Hairline() {
  return (
    <div
      className="h-px w-full bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800"
      aria-hidden
    />
  );
}

/** Donut phân bố mức */
function ReminderLevelDonut({
  levelParts,
  avgPct,
}: {
  levelParts: { level: string; count: number; pct: number }[];
  avgPct: number;
}) {
  const filtered = levelParts.filter((x) => x.pct > 0);
  const { stops } = filtered.reduce<{ stops: string[]; acc: number }>(
    (s, { level, pct }) => {
      const cfg = getReminderLevelConfig(level);
      const start = s.acc;
      const next = s.acc + pct;
      return {
        stops: [...s.stops, `${cfg.hexColor} ${start}% ${next}%`],
        acc: next,
      };
    },
    { stops: [], acc: 0 },
  );

  if (stops.length === 0) return null;

  return (
    <div className="relative mx-auto size-[min(100%,144px)] aspect-square max-w-[144px]">
      <div
        className="absolute inset-0 rounded-full shadow-inner shadow-neutral-900/5 dark:shadow-black/40"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      />
      <div className="absolute inset-[15%] rounded-full border border-neutral-200/60 bg-[#F9F8F6] dark:border-neutral-700 dark:bg-neutral-950" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">TB mức</span>
        <span className="text-[1.2rem] font-bold tabular-nums leading-none text-neutral-900 dark:text-neutral-50">
          {avgPct}%
        </span>
      </div>
    </div>
  );
}

function ReminderPctBarChart({ rows }: { rows: { id: string; name: string; pct: number; hex: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row, i) => {
        const w = Math.min(100, Math.max(0, row.pct));
        return (
          <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_2.5rem] items-center gap-2 sm:gap-3">
            <span className="truncate text-[11px] font-medium text-neutral-800 dark:text-neutral-200" title={row.name}>
              {row.name}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/90 dark:bg-neutral-800">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: row.hex }}
                initial={{ width: 0 }}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: easeUi }}
              />
            </div>
            <span className="text-right text-[11px] font-semibold tabular-nums text-neutral-600 dark:text-neutral-300">
              {Math.round(row.pct)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ReminderRingGauge({ label, value, stroke }: { label: string; value: number; stroke: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <svg width={64} height={64} className="-rotate-90" aria-hidden>
        <circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          className="text-neutral-200 dark:text-neutral-800"
        />
        <circle
          cx={32}
          cy={32}
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
      <span className="line-clamp-2 max-w-[88px] text-center text-[9px] font-medium leading-tight text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-[11px] font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function formatRemainingLine(r: VehicleReminder) {
  const km = r.remainingKm;
  if (km == null) return "—";
  if (km < 0) return `Quá hạn ~${Math.abs(km).toLocaleString("vi-VN")} km`;
  return `Còn ~${km.toLocaleString("vi-VN")} km`;
}

function sortRemindersForDisplay(list: VehicleReminder[]) {
  return [...list].sort((a, b) => {
    const pa = getReminderLevelConfig(a.level).priority;
    const pb = getReminderLevelConfig(b.level).priority;
    if (pa !== pb) return pa - pb;
    return (a.percentageRemaining ?? 100) - (b.percentageRemaining ?? 100);
  });
}

type DesktopCenterRemindersTabProps = {
  reminders: VehicleReminder[];
  isLoadingReminders: boolean;
};

export function DesktopCenterRemindersTab({ reminders, isLoadingReminders }: DesktopCenterRemindersTabProps) {
  const stats = useMemo(() => {
    const n = reminders.length;
    if (!n) {
      return {
        n,
        avgPct: 0,
        levelParts: [] as { level: string; count: number; pct: number }[],
      };
    }
    let sumPct = 0;
    const byLevel = new Map<string, number>();
    for (const r of reminders) {
      sumPct += r.percentageRemaining ?? 0;
      byLevel.set(r.level, (byLevel.get(r.level) ?? 0) + 1);
    }
    const levelParts = [...byLevel.entries()]
      .sort((a, b) => getReminderLevelConfig(a[0]).priority - getReminderLevelConfig(b[0]).priority)
      .map(([level, count]) => ({
        level,
        count,
        pct: (count / n) * 100,
      }));
    return {
      n,
      avgPct: Math.round(sumPct / n),
      levelParts,
    };
  }, [reminders]);

  const sorted = useMemo(() => sortRemindersForDisplay(reminders), [reminders]);

  const barChartRows = useMemo(
    () =>
      sorted.map((r) => ({
        id: r.id,
        name: r.partCategory.name,
        pct: r.percentageRemaining ?? 0,
        hex: getReminderLevelConfig(r.level).hexColor,
      })),
    [sorted],
  );

  if (isLoadingReminders) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-40 animate-pulse rounded-xl bg-neutral-100/70 dark:bg-neutral-900/45" />
        <div className="h-36 animate-pulse rounded-xl bg-neutral-100/60 dark:bg-neutral-900/40" />
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-lg bg-neutral-100/50 dark:bg-neutral-900/35" />
          <div className="h-20 animate-pulse rounded-lg bg-neutral-100/50 dark:bg-neutral-900/35" />
        </div>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: easeUi }}
      >
        <p className={labelMuted}>Chưa có dữ liệu nhắc bảo trì — khai báo phụ tùng để theo dõi tại đây.</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
      {/* Phân bố + TB */}
      <motion.section variants={item} className="pb-6">
        <SectionLabel kicker="Tổng quan" title="Phân bố mức độ" hint={`${stats.n} hạng mục đang theo dõi.`} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <ReminderLevelDonut levelParts={stats.levelParts} avgPct={stats.avgPct} />
            <div className="flex w-full flex-wrap justify-center gap-x-3 gap-y-1.5 text-[10px] text-neutral-500 lg:justify-start dark:text-neutral-400">
              {stats.levelParts.map(({ level, count }) => {
                const cfg = getReminderLevelConfig(level);
                return (
                  <span key={level} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cfg.hexColor }} />
                    {cfg.labelVi} ({count})
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800/90">
              {stats.levelParts.map(({ level, pct }) => {
                const cfg = getReminderLevelConfig(level);
                if (pct <= 0) return null;
                return (
                  <motion.div
                    key={level}
                    title={`${cfg.labelVi}: ${Math.round(pct)}%`}
                    className="h-full min-w-[4px]"
                    style={{ backgroundColor: cfg.hexColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.55, ease: easeUi }}
                  />
                );
              })}
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                  Sức khỏe phụ tùng (trung bình)
                </span>
                <span className="text-[13px] font-bold tabular-nums text-neutral-800 dark:text-neutral-200">
                  {stats.avgPct}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: BRAND }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.avgPct}%` }}
                  transition={{ duration: 0.55, ease: easeUi }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <Hairline />

      <motion.section variants={item} className="py-10">
        <SectionLabel
          kicker="So sánh"
          title="Mức còn lại theo phụ tùng"
          hint="Thang 0–100% · càng thấp càng cần xử lý."
        />
        <ReminderPctBarChart rows={barChartRows} />
      </motion.section>

      <Hairline />

      {/* Chi tiết — danh sách kẻ ngang, không card */}
      <motion.section variants={item} className="pt-6">
        <SectionLabel kicker="Chi tiết" title="Từng hạng mục" />
        <ul className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
          {sorted.map((r) => {
            const cfg = getReminderLevelConfig(r.level);
            const overdue = (r.remainingKm ?? 0) < 0;
            return (
              <li key={r.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-start sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:gap-3">
                  {r.partCategory.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.partCategory.iconUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-xl object-contain opacity-95 dark:opacity-100"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100/90 dark:bg-neutral-800/80">
                      <Layers className="size-5 text-neutral-400" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                        {r.partCategory.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          getLevelBadgeClasses(r.level),
                        )}
                      >
                        {cfg.labelVi}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-[11px] leading-snug text-neutral-600 dark:text-neutral-400",
                        overdue && "font-medium text-[#E22028] dark:text-red-400",
                      )}
                    >
                      {formatRemainingLine(r)}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-neutral-600 dark:text-neutral-400 sm:grid-cols-3">
                      <span>
                        Odo hiện:{" "}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {r.currentOdometer.toLocaleString("vi-VN")} km
                        </span>
                      </span>
                      <span>
                        Mục tiêu:{" "}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {r.targetOdometer.toLocaleString("vi-VN")} km
                        </span>
                      </span>
                      <span className="col-span-2 sm:col-span-1">
                        Dự kiến:{" "}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {r.targetDate ? dayjs(r.targetDate).format("DD/MM/YYYY") : "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <ReminderRingGauge label="Mức còn lại" value={r.percentageRemaining} stroke={cfg.hexColor} />
              </li>
            );
          })}
        </ul>
      </motion.section>

      <motion.p variants={item} className="pt-4 text-center text-[9px] text-neutral-400 dark:text-neutral-500">
        Mỗi loại phụ tùng một nhắc mới nhất · Dữ liệu từ hệ thống theo dõi km
      </motion.p>
    </motion.div>
  );
}
