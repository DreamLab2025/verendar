import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
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
