"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LicensePlateBadge } from "@/components/common/LicensePlateBadge";
import { DesktopCenterPanel } from "@/components/DesktopCenterPanel";
import { Button } from "@/components/ui/button";
import { useUserVehicles } from "@/hooks/useUserVehice";
import { useUserVehicleParts } from "@/hooks/useVehiclePart";
import { useMaintenanceRecordsByVehicle } from "@/hooks/useMaintenanceRecord";
import { useOdometerHistory } from "@/hooks/useOdometer";

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = typeof params.vehicleId === "string" ? params.vehicleId : "";

  const { vehicles, isLoading: isLoadingVehicles } = useUserVehicles({
    PageNumber: 1,
    PageSize: 10,
  });

  const vehicle = useMemo(() => vehicles.find((v) => v.id === vehicleId) ?? null, [vehicles, vehicleId]);

  const { parts, isLoading: isLoadingParts } = useUserVehicleParts(vehicleId, !!vehicleId);

  const { data: maintenanceResponse, isLoading: isLoadingMaintenance } = useMaintenanceRecordsByVehicle(
    vehicleId,
    !!vehicleId,
  );
  const maintenanceRecords = maintenanceResponse?.data ?? [];

  const { history: odometerHistory, isLoading: isLoadingOdometerHistory } = useOdometerHistory(
    vehicleId,
    { PageNumber: 1, PageSize: 20 },
    !!vehicleId,
  );

  const declarationPercent = useMemo(() => {
    if (!parts.length) return 0;
    const declared = parts.filter((p) => p.isDeclared).length;
    return Math.round((declared / parts.length) * 100);
  }, [parts]);

  if (isLoadingVehicles) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-1">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="min-h-[240px] flex-1 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
        <div className="h-48 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900 lg:hidden" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <p className="text-[15px] text-neutral-600 dark:text-neutral-400">Không tìm thấy xe hoặc bạn chưa có quyền xem.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Về danh sách xe</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:gap-4">
      <div className="relative flex min-h-[48px] shrink-0 items-center justify-center px-0 py-1 max-lg:min-h-[52px] lg:min-h-0 lg:justify-start lg:gap-3 lg:py-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 size-11 shrink-0 -translate-y-1/2 touch-manipulation rounded-xl active:bg-neutral-100 dark:active:bg-white/10 lg:static lg:top-auto lg:size-9 lg:translate-y-0 lg:rounded-md"
          asChild
        >
          <Link href="/" aria-label="Quay lại danh sách xe">
            <ArrowLeft className="size-[18px]" aria-hidden />
          </Link>
        </Button>
        <div className="flex min-w-0 justify-center px-11 max-lg:px-12 lg:px-0">
          <LicensePlateBadge
            licensePlate={vehicle.licensePlate}
            size="md"
            className="max-w-[min(100%,20rem)] origin-center scale-[1.14] max-lg:scale-[1.22] lg:scale-105"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-y-auto pb-2 touch-pan-y max-lg:gap-3 lg:flex-row lg:overflow-hidden lg:pb-0">
        <DesktopCenterPanel
          vehicle={vehicle}
          isAddSlot={false}
          parts={parts}
          isLoadingParts={isLoadingParts}
          declarationPercent={declarationPercent}
          surface="vehicleDetail"
          vehicleDetailHistory={{
            odometerHistory,
            isLoadingOdometer: isLoadingOdometerHistory,
            maintenanceRecords,
            isLoadingMaintenance,
          }}
        />
      </div>
    </div>
  );
}
