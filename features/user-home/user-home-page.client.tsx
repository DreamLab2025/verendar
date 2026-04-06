"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUserVehicles } from "@/hooks/useUserVehice";
import { useUserVehicleParts } from "@/hooks/useVehiclePart";
import { useMaintenanceRecordsByVehicle } from "@/hooks/useMaintenanceRecord";
import { useOdometerHistory } from "@/hooks/useOdometer";
import { UserHomeDesktopView, UserHomeMobileView } from "@/features/user-home/user-home-views";

export function UserHomePageClient() {
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
  const createFlowOpen = !hasVehicles || showCreateVehicle;

  const detailVehicle =
    expandedVehicleId && hasVehicles ? (vehicles.find((v) => v.id === expandedVehicleId) ?? null) : null;
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

  const handleExitCreateFlow = () => {
    setShowCreateVehicle(false);
    if (vehicles.length > 0) {
      queueMicrotask(() => setExpandedVehicleId(vehicles[0].id));
    }
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
        <div className="h-44 w-full shrink-0 animate-pulse rounded-2xl bg-neutral-200/90 lg:hidden dark:bg-neutral-800/80" />
        <div className="hidden lg:contents">
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
        </div>
      </>
    );
  }

  const shared = {
    vehicles,
    createFlowOpen,
    showVehicleDetail,
    detailVehicle,
    currentVehicle,
    hasVehicles,
    safeIndex,
    expandedVehicleId,
    showCreateVehicle,
    parts,
    isLoadingParts,
    maintenanceRecords,
    isLoadingMaintenance,
    odometerHistory,
    isLoadingOdometerHistory,
    declarationPercent,
    onCreateFlowSuccess: handleCreateFlowSuccess,
    onCreateFlowExit: hasVehicles ? handleExitCreateFlow : undefined,
    onRequestAddVehicle: handleRequestAddVehicle,
    onSelectVehicle: handleSelectVehicle,
    onExpandedChange: setExpandedVehicleId,
  };

  return (
    <>
      <UserHomeMobileView {...shared} />
      <UserHomeDesktopView {...shared} />
    </>
  );
}
