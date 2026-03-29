"use client";

import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import { MobileVehicleHome } from "@/components/common/MobileVehicleHome";
import { DesktopCenterPanel } from "@/components/DesktopCenterPanel";
import { DesktopVehicleColumn } from "@/components/DesktopVehicleColumn";
import { DesktopRightPanel } from "@/components/DesktopRightPanel";
import type { MaintenanceRecordListItem } from "@/lib/api/services/fetchMaintenanceRecord";
import type { OdometerHistoryItem } from "@/lib/api/services/fetchOdometer";

export type UserHomeSharedProps = {
  vehicles: UserVehicle[];
  createFlowOpen: boolean;
  showVehicleDetail: boolean;
  detailVehicle: UserVehicle | null;
  currentVehicle: UserVehicle | null;
  hasVehicles: boolean;
  safeIndex: number;
  expandedVehicleId: string | null;
  showCreateVehicle: boolean;
  parts: unknown[];
  isLoadingParts: boolean;
  maintenanceRecords: MaintenanceRecordListItem[];
  isLoadingMaintenance: boolean;
  odometerHistory: OdometerHistoryItem[];
  isLoadingOdometerHistory: boolean;
  declarationPercent: number;
  onCreateFlowSuccess: () => void;
  /** Mobile: đóng luồng tạo xe khi đã có ít nhất một xe */
  onCreateFlowExit?: () => void;
  onRequestAddVehicle: () => void;
  onSelectVehicle: (index: number) => void;
  onExpandedChange: (id: string | null) => void;
};

/** Chỉ mobile — `lg:hidden` */
export function UserHomeMobileView(p: UserHomeSharedProps) {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-y-auto pt-0.5 touch-pan-y lg:hidden">
      {p.createFlowOpen ? (
        <DesktopCenterPanel
          vehicle={p.hasVehicles ? p.currentVehicle : null}
          isAddSlot
          onCreateFlowSuccess={p.onCreateFlowSuccess}
          onCreateFlowExit={p.onCreateFlowExit}
          parts={p.parts as never}
          isLoadingParts={p.isLoadingParts}
          declarationPercent={p.declarationPercent}
        />
      ) : (
        <MobileVehicleHome
          vehicles={p.vehicles}
          onRequestAddVehicle={p.onRequestAddVehicle}
          isAddSlot={p.showCreateVehicle && p.hasVehicles}
        />
      )}
    </div>
  );
}

/** Chỉ desktop — `hidden lg:contents` để con tham gia flex 3 cột của layout */
export function UserHomeDesktopView(p: UserHomeSharedProps) {
  return (
    <div className="hidden lg:contents">
      <DesktopVehicleColumn
        vehicles={p.vehicles}
        expandedVehicleId={p.expandedVehicleId}
        onExpandedChange={p.onExpandedChange}
        currentVehicleId={p.expandedVehicleId}
        currentIndex={p.safeIndex}
        isAddSlot={p.showCreateVehicle && p.hasVehicles}
        onSelect={p.onSelectVehicle}
        onRequestAddVehicle={p.onRequestAddVehicle}
        declarationPercentForSelected={p.declarationPercent}
      />

      {p.createFlowOpen ? (
        <DesktopCenterPanel
          vehicle={p.hasVehicles ? p.currentVehicle : null}
          isAddSlot
          onCreateFlowSuccess={p.onCreateFlowSuccess}
          onCreateFlowExit={p.onCreateFlowExit}
          parts={p.parts as never}
          isLoadingParts={p.isLoadingParts}
          declarationPercent={p.declarationPercent}
        />
      ) : p.showVehicleDetail && p.detailVehicle ? (
        <>
          <DesktopCenterPanel
            vehicle={p.detailVehicle}
            isAddSlot={false}
            onCreateFlowSuccess={p.onCreateFlowSuccess}
            parts={p.parts as never}
            isLoadingParts={p.isLoadingParts}
            declarationPercent={p.declarationPercent}
          />
          <DesktopRightPanel
            vehicle={p.detailVehicle}
            maintenanceRecords={p.maintenanceRecords}
            isLoadingMaintenance={p.isLoadingMaintenance}
            odometerHistory={p.odometerHistory}
            isLoadingOdometerHistory={p.isLoadingOdometerHistory}
          />
        </>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 rounded-lg bg-[#F9F8F6] dark:bg-neutral-950" aria-hidden />
      )}
    </div>
  );
}
