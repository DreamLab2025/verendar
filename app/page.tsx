"use client";

import { useMemo, useState } from "react";
import { useUserVehicles } from "@/hooks/useUserVehice";
import { useUserVehicleParts } from "@/hooks/useVehiclePart";
import { useMaintenanceRecordsByVehicle } from "@/hooks/useMaintenanceRecord";
import { useOdometerHistory } from "@/hooks/useOdometer";
import { DesktopCenterPanel } from "@/components/DesktopCenterPanel";
import { DesktopVehicleColumn } from "@/components/DesktopVehicleColumn";
import { DesktopRightPanel } from "@/components/DesktopRightPanel";

export default function HomeDesktopView() {
  const { vehicles, isLoading } = useUserVehicles({
    PageNumber: 1,
    PageSize: 10,
  });
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);

  const isAddSlot = currentVehicleIndex === vehicles.length;
  const currentVehicle = isAddSlot ? null : vehicles[currentVehicleIndex] || vehicles[0];
  const vehicleId = currentVehicle?.id ?? "";
  const dataEnabled = !!vehicleId && !isAddSlot;

  const { parts, isLoading: isLoadingParts } = useUserVehicleParts(vehicleId, dataEnabled);

  const { data: maintenanceResponse, isLoading: isLoadingMaintenance } = useMaintenanceRecordsByVehicle(
    vehicleId,
    dataEnabled,
  );
  const maintenanceRecords = maintenanceResponse?.data ?? [];

  const { history: odometerHistory, isLoading: isLoadingOdometerHistory } = useOdometerHistory(
    vehicleId,
    { PageNumber: 1, PageSize: 20 },
    dataEnabled,
  );

  const declarationPercent = useMemo(() => {
    if (!parts.length) return 0;
    const declared = parts.filter((p) => p.isDeclared).length;
    return Math.round((declared / parts.length) * 100);
  }, [parts]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        <div className="w-[260px] shrink-0 animate-pulse bg-neutral-200 dark:bg-neutral-900" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="h-14 shrink-0 animate-pulse border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950" />
          <div className="flex min-h-0 flex-1">
            <div className="w-[280px] shrink-0 animate-pulse bg-neutral-100 dark:bg-neutral-900" />
            <div className="min-h-0 min-w-0 flex-1 animate-pulse bg-neutral-50 dark:bg-neutral-950" />
            <div className="hidden w-[300px] shrink-0 animate-pulse bg-neutral-100 lg:block dark:bg-neutral-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#F9F8F6] dark:bg-neutral-950">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <DesktopVehicleColumn
            vehicles={vehicles}
            currentVehicleId={vehicleId || null}
            currentIndex={currentVehicleIndex}
            isAddSlot={isAddSlot}
            onSelect={setCurrentVehicleIndex}
            declarationPercentForSelected={declarationPercent}
          />

          <DesktopCenterPanel
            vehicle={currentVehicle}
            isAddSlot={isAddSlot}
            parts={parts}
            isLoadingParts={isLoadingParts}
            declarationPercent={declarationPercent}
          />
          <DesktopRightPanel
            vehicle={currentVehicle}
            isAddSlot={isAddSlot}
            maintenanceRecords={maintenanceRecords}
            isLoadingMaintenance={isLoadingMaintenance}
            odometerHistory={odometerHistory}
            isLoadingOdometerHistory={isLoadingOdometerHistory}
          />
        </div>
      </div>
    </div>
  );
}
