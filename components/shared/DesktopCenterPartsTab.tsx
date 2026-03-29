"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Package, Wrench } from "lucide-react";

import { DeclarePartFlow } from "@/components/shared/DeclarePartFlow";
import { Button } from "@/components/ui/button";
import ScrollPickerPanel, { type PickerItem } from "@/components/ui/customize/scroll-picker-panel";
import SafeImage from "@/components/ui/SafeImage";
import type { UserVehiclePart } from "@/lib/api/services/fetchUserVehicle";
import { getReminderLevelConfig } from "@/lib/config/reminderLevelConfig";
import { cn } from "@/lib/utils";
import { usePartCategoryReminders } from "@/hooks/useTrackingReminder";

const BRAND = "#E22028";

type PartPickerItem = PickerItem & { part: UserVehiclePart };

type DesktopCenterPartsTabProps = {
  userVehicleId: string;
  parts: UserVehiclePart[];
  isLoadingParts: boolean;
  selectedPartId: string | null;
  onTogglePart: (partId: string) => void;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function PartStatusDetail({ item, userVehicleId }: { item: PickerItem; userVehicleId: string }) {
  const part = (item as PartPickerItem).part;
  const partCategorySlug = part?.partCategorySlug?.trim();
  const { reminders, isLoading, isError, refetch } = usePartCategoryReminders(userVehicleId, partCategorySlug, true);
  /** Chỉ hiện flow khai báo khi đúng part đang được mở (đổi part trong picker là tự ẩn, không cần effect) */
  const [declarePartId, setDeclarePartId] = useState<string | null>(null);
  const showDeclareFlow = declarePartId === part.id && !part.isDeclared;
  if (!part) return null;
  const reminder = reminders.find((r) => r.status === "Active") ?? reminders[0];
  const partMeta = reminder?.partCategory;
  const formatMaybeDate = (value: string | null | undefined) => (value ? formatDate(value) : "—");
  const formatMaybeNumber = (value: number | null | undefined) =>
    typeof value === "number" ? value.toLocaleString("vi-VN") : "—";

  if (isLoading) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-3 py-2" aria-busy="true">
        <div className="h-6 w-48 animate-pulse rounded bg-red-100/70 dark:bg-neutral-700" />
        <div className="h-32 w-full animate-pulse rounded-xl bg-neutral-200/90 dark:bg-neutral-700/90" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 px-2 py-8 text-center">
        <div className="rounded-full bg-amber-500/10 p-4 dark:bg-amber-500/15">
          <Wrench className="size-10 text-amber-600 dark:text-amber-400" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{part.partCategoryName}</p>
          <p className="max-w-sm text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            Không tải được dữ liệu nhắc nhở cho phụ tùng này. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  if (reminder) {
    const cfg = getReminderLevelConfig(reminder.level);
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      >
        <div className="border-b border-neutral-200/90 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-[12px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-300">
              {Math.round(reminder.percentageRemaining)}%
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-semibold text-neutral-900 dark:text-neutral-100">
                {part.partCategoryName}
              </h3>
              <p className="text-[13px] font-medium text-red-600 dark:text-red-400">Cần bảo dưỡng</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span
                  className="rounded-full px-2 py-0.5 font-semibold"
                  style={{ backgroundColor: cfg.hexColorLight, color: cfg.hexColor }}
                >
                  {cfg.labelVi}
                </span>
                <span>{reminder.status}</span>
                <span>{reminder.isNotified ? "Đã gửi thông báo" : "Chưa gửi thông báo"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-neutral-200/90 dark:divide-neutral-800">
          <div className="flex items-center justify-between px-5 py-3 text-[13px]">
            <span className="text-neutral-500 dark:text-neutral-400">Hiện tại</span>
            <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatMaybeNumber(reminder.currentOdometer)} km
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-[13px]">
            <span className="text-neutral-500 dark:text-neutral-400">Mốc bảo dưỡng</span>
            <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatMaybeNumber(reminder.targetOdometer)} km
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-[13px]">
            <span className="text-neutral-500 dark:text-neutral-400">Vượt quá</span>
            <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
              {formatMaybeNumber(Math.abs(reminder.remainingKm))} km
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-200/90 px-5 py-3 text-[12px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Ngày đến hạn:{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatMaybeDate(reminder.targetDate)}
              </span>
            </span>
            {/* <span>Cycle: <span className="font-medium text-neutral-900 dark:text-neutral-100">{reminder.trackingCycleId}</span></span> */}
          </div>
        </div>

        {partMeta ? (
          <div className="border-t border-neutral-200/90 px-5 py-4 dark:border-neutral-800">
            <p className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">Dấu hiệu nhận biết</p>
            <div className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              {(partMeta.identificationSigns || "Chưa có dữ liệu")
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((sign, idx) => (
                  <p key={`sign-${idx}`}>• {sign}</p>
                ))}
            </div>

            <p className="mt-4 text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
              Hậu quả nếu không xử lý
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(partMeta.consequencesIfNotHandled || "Chưa có dữ liệu")
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((risk, idx) => (
                  <span
                    key={`risk-${idx}`}
                    className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:bg-red-900/25 dark:text-red-300"
                  >
                    {risk}
                  </span>
                ))}
            </div>
          </div>
        ) : null}
      </motion.div>
    );
  }

  if (showDeclareFlow && !part.isDeclared) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DeclarePartFlow
          key={part.id}
          userVehicleId={userVehicleId}
          part={part}
          variant="embedded"
          onDismiss={() => setDeclarePartId(null)}
          onDeclared={() => {
            void refetch();
            setDeclarePartId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 px-2 py-8 text-center">
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
        <Button
          type="button"
          onClick={() => setDeclarePartId(part.id)}
          className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Khai báo phụ tùng
        </Button>
      ) : null}
    </div>
  );
}

export function DesktopCenterPartsTab({
  userVehicleId,
  parts,
  isLoadingParts,
  selectedPartId,
  onTogglePart,
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
    if (!el || typeof ResizeObserver === "undefined" || typeof window === "undefined") return;

    /** Phải theo viewport (lg), không dùng `el.clientWidth` — cột giữa ~60% màn hình luôn < 1024px */
    const mql = window.matchMedia("(min-width: 1024px)");

    const apply = () => {
      const h = el.clientHeight;
      const isDesktopViewport = mql.matches;
      if (!isDesktopViewport) {
        const capped = h >= 180 ? Math.min(Math.max(Math.round(h * 0.42), 260), 320) : 280;
        setPanelHeight(capped);
      } else if (h > 0) {
        setPanelHeight(Math.max(360, h));
      }
    };

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    const onViewport = () => apply();
    mql.addEventListener("change", onViewport);
    apply();

    return () => {
      ro.disconnect();
      mql.removeEventListener("change", onViewport);
    };
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
        className="flex min-h-[420px] flex-col gap-4 px-3 sm:px-4 max-lg:min-h-[320px] max-lg:gap-3 lg:px-6 lg:rounded-2xl lg:border lg:border-neutral-200/90 lg:bg-white lg:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] lg:ring-1 lg:ring-red-600/10 dark:lg:border-neutral-800 dark:lg:bg-neutral-900/50 dark:lg:ring-white/5"
      >
        <div className="h-5 w-40 animate-pulse rounded bg-red-100/60 dark:bg-neutral-800" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/80" />
        <div className="mt-4 flex flex-1 gap-4 max-lg:flex-col max-lg:gap-3">
          <div className="h-12 w-full max-w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800 lg:hidden" />
          <div className="hidden w-16 shrink-0 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800 lg:block" />
          <div className="min-h-[200px] flex-1 animate-pulse rounded-lg bg-neutral-100/80 dark:bg-neutral-800/80 lg:min-h-[280px] lg:rounded-2xl lg:bg-neutral-50 dark:lg:bg-neutral-800/80" />
        </div>
      </motion.div>
    );
  }

  if (parts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-3 border-y border-dashed border-neutral-200 px-3 py-14 text-center dark:border-neutral-700 sm:px-4 lg:rounded-2xl lg:border lg:border-dashed lg:border-neutral-300 lg:bg-white lg:px-6 lg:py-16 lg:ring-1 lg:ring-red-600/10 dark:lg:bg-neutral-900/40 dark:lg:ring-white/4"
      >
        <p className="text-[14px] text-neutral-600 dark:text-neutral-400">Chưa có danh sách phụ tùng cho xe này.</p>
        <Link
          href={`/vehicle/${userVehicleId}`}
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
      className="flex min-h-0 flex-1 flex-col gap-4 px-3 sm:px-4 lg:px-0"
    >
      <section className="flex min-h-0 flex-1 flex-col max-lg:bg-transparent lg:rounded-2xl lg:border lg:border-neutral-200/90 lg:bg-white lg:p-7 lg:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] lg:ring-1 lg:ring-red-600/10 dark:lg:border-neutral-800 dark:lg:bg-neutral-900/55 dark:lg:ring-white/6">
        <header className="mb-4 shrink-0 border-b border-neutral-200/80 pb-3 dark:border-neutral-800/80 lg:mb-5 lg:border-neutral-100 lg:pb-4">
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
            key={`${userVehicleId}-${parts.map((p) => p.id).join("-")}`}
            items={pickerItems as PickerItem[]}
            visibleCount={6}
            slotGap={12}
            panelHeight={panelHeight}
            defaultSelectedKey={defaultKey}
            onSelect={handleSelect}
            renderItem={renderItem}
            renderDetail={(item) => <PartStatusDetail item={item} userVehicleId={userVehicleId} />}
            accentColor={BRAND}
            itemClassName={cn("transition-transform")}
            activeItemClassName="ring-2 ring-white/35"
            detailClassName="scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            className="w-full max-w-full min-h-0 lg:flex-1"
          />
        </div>
      </section>
    </motion.div>
  );
}
