"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Package, Wrench } from "lucide-react";

import ScrollPickerPanel, { type PickerItem } from "@/components/ui/customize/scroll-picker-panel";
import SafeImage from "@/components/ui/SafeImage";
import type { UserVehiclePart } from "@/lib/api/services/fetchUserVehicle";
import type { VehicleReminder } from "@/lib/api/services/fetchTrackingReminder";
import { getReminderLevelConfig } from "@/lib/config/reminderLevelConfig";
import { cn } from "@/lib/utils";

const BRAND = "#E22028";

type PartPickerItem = PickerItem & { part: UserVehiclePart };

type DesktopCenterPartsTabProps = {
  vehicleId: string;
  parts: UserVehiclePart[];
  isLoadingParts: boolean;
  selectedPartId: string | null;
  onTogglePart: (partId: string) => void;
  reminders: VehicleReminder[];
  isLoadingReminders: boolean;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function PartStatusDetail({
  item,
  reminders,
  vehicleId,
}: {
  item: PickerItem;
  reminders: VehicleReminder[];
  vehicleId: string;
}) {
  const part = (item as PartPickerItem).part;
  if (!part) return null;

  const reminder = reminders.find(
    (r) => r.partCategory.id === part.partCategoryId || r.partCategory.code === part.partCategoryCode,
  );

  if (reminder) {
    const cfg = getReminderLevelConfig(reminder.level);
    return (
      <div className="flex min-h-0 flex-col gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-red-600 dark:text-red-400">
            Nhắc nhở
          </p>
          <h3 className="mt-1.5 text-[18px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {part.partCategoryName}
          </h3>
        </div>

        <div
          className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/3 dark:bg-neutral-950/50 dark:ring-white/6"
          style={{ borderColor: cfg.hexBorderColor }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: cfg.hexColorLight, color: cfg.hexColor }}
            >
              {cfg.labelVi}
            </span>
            <span className="text-[13px] tabular-nums text-neutral-700 dark:text-neutral-300">
              Còn lại ~{Math.round(reminder.percentageRemaining)}%
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">Km còn lại (ước tính)</dt>
              <dd className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                {reminder.remainingKm.toLocaleString("vi-VN")} km
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">Dự kiến đến hạn</dt>
              <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                {formatDate(reminder.targetDate)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500 dark:text-neutral-400">Odo mục tiêu</dt>
              <dd className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                {reminder.targetOdometer.toLocaleString("vi-VN")} km
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 px-2 py-8 text-center">
      <div className="rounded-full bg-red-600/10 p-4 dark:bg-red-500/15">
        <Wrench className="size-10 text-red-600 dark:text-red-400" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{part.partCategoryName}</p>
        <p className="max-w-sm text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          {part.isDeclared
            ? "Chưa có nhắc nhở cho phụ tùng này. Hệ thống sẽ cập nhật khi đủ dữ liệu theo dõi."
            : "Chưa khai báo phụ tùng — khai báo để nhận nhắc nhở thay thế và bảo dưỡng đúng lúc."}
        </p>
      </div>
      {!part.isDeclared ? (
        <Link
          href={`/vehicle/${vehicleId}`}
          className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Khai báo phụ tùng
        </Link>
      ) : null}
    </div>
  );
}

export function DesktopCenterPartsTab({
  vehicleId,
  parts,
  isLoadingParts,
  selectedPartId,
  onTogglePart,
  reminders,
  isLoadingReminders,
}: DesktopCenterPartsTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(480);

  const pickerItems: PartPickerItem[] = useMemo(
    () =>
      parts.map((p) => ({
        key: p.id,
        label: p.partCategoryName,
        part: p,
      })),
    [parts],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const apply = () => {
      const h = el.clientHeight;
      // Khớp chiều cao panel chi tiết; chỉ giới hạn tối thiểu để picker vẫn dùng được
      setPanelHeight(Math.max(360, h));
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, [parts.length, isLoadingParts]);

  const defaultKey = selectedPartId && parts.some((p) => p.id === selectedPartId) ? selectedPartId : parts[0]?.id;

  const handleSelect = useCallback(
    (item: PickerItem) => {
      onTogglePart(item.key);
    },
    [onTogglePart],
  );

  const renderItem = useCallback((item: PickerItem, isHighlighted: boolean) => {
    const p = (item as PartPickerItem).part;
    const size = isHighlighted ? 56 : 44;
    return (
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-[inherit]">
        {p.iconUrl ? (
          <SafeImage
            src={p.iconUrl}
            alt={p.partCategoryName}
            width={size}
            height={size}
            className={cn("object-contain", isHighlighted && "brightness-0 invert")}
          />
        ) : (
          <Package
            className={cn("size-[55%]", isHighlighted ? "text-white" : "text-neutral-800 dark:text-neutral-200")}
            aria-hidden
          />
        )}
      </span>
    );
  }, []);

  if (isLoadingParts) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[420px] flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] ring-1 ring-red-600/10 dark:border-neutral-800 dark:bg-neutral-900/50 dark:ring-white/5"
      >
        <div className="h-5 w-40 animate-pulse rounded bg-red-100/60 dark:bg-neutral-800" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/80" />
        <div className="mt-4 flex flex-1 gap-4">
          <div className="w-16 shrink-0 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          <div className="min-h-[280px] flex-1 animate-pulse rounded-2xl bg-neutral-50 dark:bg-neutral-800/80" />
        </div>
      </motion.div>
    );
  }

  if (parts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center ring-1 ring-red-600/10 dark:border-neutral-700 dark:bg-neutral-900/40 dark:ring-white/4"
      >
        <p className="text-[14px] text-neutral-600 dark:text-neutral-400">Chưa có danh sách phụ tùng cho xe này.</p>
        <Link
          href={`/vehicle/${vehicleId}`}
          className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          Khai báo phụ tùng
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-neutral-200/90 bg-white p-7 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] ring-1 ring-red-600/10 dark:border-neutral-800 dark:bg-neutral-900/55 dark:ring-white/6 sm:p-5">
        <header className="mb-5 shrink-0 border-b border-neutral-100 pb-4 dark:border-neutral-800/80">
          <h3
            className="border-l-[3px] border-solid pl-3 text-[15px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
            style={{ borderLeftColor: BRAND }}
          >
            Tình trạng
          </h3>
          <p className="mt-2 pl-3 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            Quản lý và kiểm tra tình trạng phụ tùng xe
          </p>
        </header>

        <div ref={containerRef} className="min-h-0 w-full flex-1">
          <ScrollPickerPanel
            key={`${vehicleId}-${parts.map((p) => p.id).join("-")}`}
            items={pickerItems as PickerItem[]}
            visibleCount={6}
            slotGap={12}
            panelHeight={panelHeight}
            defaultSelectedKey={defaultKey}
            onSelect={handleSelect}
            renderItem={renderItem}
            renderDetail={(item) =>
              isLoadingReminders ? (
                <div className="space-y-3 py-2" aria-busy="true">
                  <div className="h-6 w-48 animate-pulse rounded bg-red-100/70 dark:bg-neutral-700" />
                  <div className="h-32 w-full animate-pulse rounded-xl bg-neutral-200/90 dark:bg-neutral-700/90" />
                </div>
              ) : (
                <PartStatusDetail item={item} reminders={reminders} vehicleId={vehicleId} />
              )
            }
            accentColor={BRAND}
            itemClassName={cn("transition-transform")}
            activeItemClassName="ring-2 ring-white/35"
            detailClassName="scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            className="w-full max-w-full"
          />
        </div>
      </section>
    </motion.div>
  );
}
