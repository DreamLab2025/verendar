"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUserVehicles } from "@/hooks/useUserVehice";
import { useUserVehicleParts } from "@/hooks/useVehiclePart";
import { useMaintenanceRecordsByVehicle } from "@/hooks/useMaintenanceRecord";
import { useOdometerHistory } from "@/hooks/useOdometer";
import { DesktopCenterPanel } from "@/components/DesktopCenterPanel";
import { DesktopVehicleColumn } from "@/components/DesktopVehicleColumn";
import { DesktopRightPanel } from "@/components/DesktopRightPanel";

export default function UserHomePage() {
  const { vehicles, isLoading } = useUserVehicles({
    PageNumber: 1,
    PageSize: 10,
  });
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const didAutoExpandRef = useRef(false);

  const hasVehicles = vehicles.length > 0;
  const safeIndex = hasVehicles ? Math.min(Math.max(0, currentVehicleIndex), vehicles.length - 1) : 0;

  const currentVehicle = hasVehicles ? (vehicles[safeIndex] ?? vehicles[0]) : null;
  /** Giữa phải luôn có nội dung: không xe → form tạo; có xe → mặc định chi tiết, trừ khi bấm Thêm xe */
  const createFlowOpen = !hasVehicles || showCreateVehicle;

  const detailVehicle =
    expandedVehicleId && hasVehicles ? (vehicles.find((v) => v.id === expandedVehicleId) ?? null) : null;
  /** Chỉ khi đang mở card xe mới hiện khối giữa + phải (đồng bộ với viền đỏ / phóng to) */
  const showVehicleDetail = !createFlowOpen && !!detailVehicle;
  const vehicleId = showVehicleDetail ? detailVehicle!.id : "";
  const dataEnabled = !!vehicleId;

  useEffect(() => {
    if (!hasVehicles) {
      didAutoExpandRef.current = false;
      queueMicrotask(() => setExpandedVehicleId(null));
      return;
    }
    if (didAutoExpandRef.current) return;
    didAutoExpandRef.current = true;
    queueMicrotask(() => setExpandedVehicleId(vehicles[0].id));
  }, [hasVehicles, vehicles]);

  useEffect(() => {
    if (!expandedVehicleId) return;
    if (!vehicles.some((v) => v.id === expandedVehicleId)) {
      queueMicrotask(() => setExpandedVehicleId(vehicles[0]?.id ?? null));
    }
  }, [vehicles, expandedVehicleId]);

  const handleSelectVehicle = (index: number) => {
    setShowCreateVehicle(false);
    setCurrentVehicleIndex(index);
  };

  const handleRequestAddVehicle = () => {
    setExpandedVehicleId(null);
    setShowCreateVehicle(true);
  };

  const handleCreateFlowSuccess = () => {
    setShowCreateVehicle(false);
  };

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
      <>
        <div className="h-full min-h-0 w-[22%] shrink-0 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-900" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="h-14 shrink-0 animate-pulse rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950" />
          <div className="mt-4 flex min-h-0 flex-1 gap-4">
            <div className="min-h-0 min-w-0 flex-1 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900" />
            <div className="hidden w-[18%] shrink-0 animate-pulse rounded-md bg-neutral-100 lg:block dark:bg-neutral-900" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DesktopVehicleColumn
        vehicles={vehicles}
        expandedVehicleId={expandedVehicleId}
        onExpandedChange={setExpandedVehicleId}
        currentVehicleId={expandedVehicleId}
        currentIndex={safeIndex}
        isAddSlot={showCreateVehicle && hasVehicles}
        onSelect={handleSelectVehicle}
        onRequestAddVehicle={handleRequestAddVehicle}
        declarationPercentForSelected={declarationPercent}
      />

      {createFlowOpen ? (
        <DesktopCenterPanel
          vehicle={hasVehicles ? currentVehicle : null}
          isAddSlot
          onCreateFlowSuccess={handleCreateFlowSuccess}
          parts={parts}
          isLoadingParts={isLoadingParts}
          declarationPercent={declarationPercent}
        />
      ) : showVehicleDetail ? (
        <>
          <DesktopCenterPanel
            vehicle={detailVehicle}
            isAddSlot={false}
            onCreateFlowSuccess={handleCreateFlowSuccess}
            parts={parts}
            isLoadingParts={isLoadingParts}
            declarationPercent={declarationPercent}
          />
          <DesktopRightPanel
            vehicle={detailVehicle}
            maintenanceRecords={maintenanceRecords}
            isLoadingMaintenance={isLoadingMaintenance}
            odometerHistory={odometerHistory}
            isLoadingOdometerHistory={isLoadingOdometerHistory}
          />
        </>
      ) : (
        <div
          className="min-h-0 min-w-0 flex-1 rounded-lg bg-[#F9F8F6] dark:bg-neutral-950"
          aria-hidden
        />
      )}
    </>
  );
}
