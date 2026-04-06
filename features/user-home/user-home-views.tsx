"use client";

import { CenterPanel } from "./desktop/center-panel";
import { RightPanel } from "./desktop/right-panel";
import { VehicleColumn } from "./desktop/vehicle-column";
import { VehicleHome } from "./mobile/vehicle-home";
import type { UserHomeSharedProps } from "./types";

export type { UserHomeSharedProps } from "./types";

/** Chỉ mobile — `lg:hidden` */
export function UserHomeMobileView(p: UserHomeSharedProps) {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-y-auto pt-0.5 touch-pan-y lg:hidden">
      {p.createFlowOpen ? (
        <CenterPanel
          vehicle={p.hasVehicles ? p.currentVehicle : null}
          isAddSlot
          onCreateFlowSuccess={p.onCreateFlowSuccess}
          onCreateFlowExit={p.onCreateFlowExit}
          parts={p.parts as never}
          isLoadingParts={p.isLoadingParts}
          declarationPercent={p.declarationPercent}
        />
      ) : (
        <VehicleHome
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
      <VehicleColumn
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
        <CenterPanel
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
          <CenterPanel
            vehicle={p.detailVehicle}
            isAddSlot={false}
            onCreateFlowSuccess={p.onCreateFlowSuccess}
            parts={p.parts as never}
            isLoadingParts={p.isLoadingParts}
            declarationPercent={p.declarationPercent}
          />
          <RightPanel
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
