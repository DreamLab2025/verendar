import api8080Service from "../api8080Service";

export interface MaintenanceRecordItem {
  partCategoryCode: string;
  // Case 1: Product from system
  partProductId?: string;
  // Case 2: Custom product (not in system)
  customPartName?: string;
  customKmInterval?: number;
  customMonthsInterval?: number;
  // Common fields
  instanceIdentifier?: string;
  price?: number;
  itemNotes?: string;
  updatesTracking: boolean;
  predictedNextOdometer?: number;
  predictedNextDate?: string; // ISO date string
}

export interface CreateMaintenanceRecordRequest {
  userVehicleId: string;
  serviceDate: string; // ISO date string (YYYY-MM-DD)
  odometerAtService: number;
  garageName?: string;
  totalCost?: number;
  notes?: string;
  invoiceImageUrl?: string;
  items: MaintenanceRecordItem[];
}

export interface MaintenanceRecordTrackingReminder {
  id: string;
  level: string;
  status?: "Active" | "Passed" | "Resolved";
  currentOdometer: number;
  targetOdometer: number;
  remainingKm?: number;
  targetDate: string;
  percentageRemaining: number;
  isNotified: boolean;
  notifiedDate?: string | null;
  isDismissed: boolean;
  dismissedDate?: string | null;
}

export interface MaintenanceRecordTracking {
  id: string;
  partCategoryId: string;
  partCategoryName: string;
  partCategoryCode: string;
  instanceIdentifier?: string;
  currentPartProductId: string | null;
  currentPartProductName: string | null;
  lastReplacementOdometer: number;
  lastReplacementDate: string;
  customKmInterval?: number;
  customMonthsInterval?: number;
  predictedNextOdometer?: number;
  predictedNextDate?: string;
  isDeclared: boolean;
  reminders: MaintenanceRecordTrackingReminder[];
}

export interface MaintenanceRecordItemResponse {
  maintenanceRecordItemId: string;
  partCategoryCode: string;
  tracking: MaintenanceRecordTracking;
}

export interface MaintenanceRecordResponse {
  maintenanceRecordId: string;
  items: MaintenanceRecordItemResponse[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  metadata: string | null;
}

export interface MaintenanceRecordListItem {
  id: string;
  userVehicleId: string;
  serviceDate: string; // ISO date string (YYYY-MM-DD)
  odometerAtService: number;
  garageName: string | null;
  totalCost: number;
  notes: string | null;
  invoiceImageUrl: string | null;
  itemCount: number;
}

export interface MaintenanceRecordDetailItem {
  id: string;
  partName: string;
  partCategoryCode: string;
  partProductId: string | null;
  instanceIdentifier: string | null;
  price: number;
  notes: string | null;
}

export interface MaintenanceRecordDetail {
  id: string;
  userVehicleId: string;
  serviceDate: string; // ISO date string (YYYY-MM-DD)
  odometerAtService: number;
  garageName: string | null;
  totalCost: number;
  notes: string | null;
  invoiceImageUrl: string | null;
  items: MaintenanceRecordDetailItem[];
}

export const MaintenanceRecordService = {
  createMaintenanceRecord: async (payload: CreateMaintenanceRecordRequest) => {
    const response = await api8080Service.post<ApiResponse<MaintenanceRecordResponse>>(
      `/api/v1/maintenance-records`,
      payload,
    );
    return response.data;
  },

  getMaintenanceRecordsByVehicle: async (userVehicleId: string) => {
    const response = await api8080Service.get<ApiResponse<MaintenanceRecordListItem[]>>(`/api/v1/maintenance-records`, {
      userVehicleId,
    });
    return response.data;
  },

  getMaintenanceRecordById: async (maintenanceRecordId: string) => {
    const response = await api8080Service.get<ApiResponse<MaintenanceRecordDetail>>(
      `/api/v1/maintenance-records/${maintenanceRecordId}`,
    );
    return response.data;
  },
};

export default MaintenanceRecordService;
