"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { UserVehicle, UserVehiclePart } from "@/lib/api/services/fetchUserVehicle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUserVehicleReminders } from "@/hooks/useTrackingReminder";
import { DesktopCenterOverviewTab } from "@/components/common/DesktopCenterOverviewTab";
import { DesktopCenterPartsTab } from "@/components/common/DesktopCenterPartsTab";
import { DesktopCenterRemindersTab } from "@/components/common/DesktopCenterRemindersTab";

const BRAND = "#E22028";
const labelMuted = "text-[12px] text-neutral-500 dark:text-neutral-400";

type DesktopCenterPanelProps = {
  vehicle: UserVehicle | null;
  isAddSlot: boolean;
  parts: UserVehiclePart[];
  isLoadingParts: boolean;
  declarationPercent: number;
};

export function DesktopCenterPanel({
  vehicle,
  isAddSlot,
  parts,
  isLoadingParts,
  declarationPercent,
}: DesktopCenterPanelProps) {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  const { reminders, isLoading: isLoadingReminders } = useUserVehicleReminders(vehicle?.id ?? "");

  const topReminders = useMemo(() => {
    return [...reminders].sort((a, b) => (b.percentageRemaining ?? 0) - (a.percentageRemaining ?? 0)).slice(0, 3);
  }, [reminders]);

  if (isAddSlot || !vehicle) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden bg-white px-5 py-6 dark:bg-neutral-950 sm:px-6">
        <p className="max-w-sm text-center text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Chọn một xe trong danh sách hoặc thêm xe mới để xem tổng quan.
        </p>
        <Link
          href="/vehicle/add"
          className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          Thêm xe
        </Link>
      </section>
    );
  }

  const odoStr = vehicle.currentOdometer.toLocaleString("vi-VN").padStart(6, "0");
  const avg = vehicle.averageKmPerDay ?? 0;

  const tabPanelClass =
    "mt-4 flex min-h-0 flex-1 flex-col overflow-hidden outline-none ring-0 focus-visible:ring-0 data-[state=inactive]:hidden md:mt-5";

  /** Ẩn thanh scroll (Tailwind arbitrary — không phụ thuộc @layer utilities) */
  const tabScrollAreaClass =
    "scrollbar-hide flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";

  return (
    <section className="flex h-full min-h-0 w-[60%] flex-col overflow-hidden rounded-md bg-[#F9F8F6] py-4 dark:bg-neutral-950 sm:px-5 sm:py-5">
      <div className="shrink-0 space-y-1">
        <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-1">
          <p
            className={cn(
              "font-odo-seven-segment text-center text-[2.75rem] font-normal leading-none tabular-nums tracking-widest text-neutral-900 dark:text-neutral-100",
              "sm:text-[3.25rem] md:text-[3.75rem] lg:text-[4.25rem] xl:text-[4.75rem]",
            )}
          >
            {odoStr}
          </p>
          <span className="inline-block shrink-0 pb-1 font-sans text-lg font-semibold tracking-normal text-neutral-500 sm:text-xl md:pb-1.5 md:text-2xl">
            Km
          </span>
        </div>
        <p className={`text-center ${labelMuted}`}>
          TRUNG BÌNH: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{avg} km/ngày</span>
        </p>
      </div>

      <Tabs key={vehicle.id} defaultValue="overview" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TabsList variant="line" className="w-full shrink-0 justify-center sm:justify-start">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="parts">Tình Trạng</TabsTrigger>
          <TabsTrigger value="reminders">Nhắc Nhở</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={tabPanelClass}>
          <div className={tabScrollAreaClass}>
            <DesktopCenterOverviewTab
              vehicle={vehicle}
              declarationPercent={declarationPercent}
              topReminders={topReminders}
              isLoadingReminders={isLoadingReminders}
            />
          </div>
        </TabsContent>

        <TabsContent value="parts" className={tabPanelClass}>
          <div className={tabScrollAreaClass}>
            <DesktopCenterPartsTab
              userVehicleId={vehicle.id}
              parts={parts}
              isLoadingParts={isLoadingParts}
              selectedPartId={selectedPartId}
              onTogglePart={(id) => setSelectedPartId(id)}
            />
          </div>
        </TabsContent>

        <TabsContent value="reminders" className={tabPanelClass}>
          <div className={tabScrollAreaClass}>
            <DesktopCenterRemindersTab reminders={reminders} isLoadingReminders={isLoadingReminders} />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
