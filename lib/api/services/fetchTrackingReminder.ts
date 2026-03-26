import api8080Service from "../api8080Service";
import { PartTrackingReminder, ReminderDetailStatus, TrackingCycleSummary } from "./fetchVehiclePart";

export type ReminderLevel = "Critical" | "High" | "Medium" | "Low" | "Normal" | "Warning";

export interface ApplyTrackingRequest {
  partCategoryCode: string;
  lastReplacementOdometer: number;
  lastReplacementDate: string;
  predictedNextOdometer: number;
  predictedNextDate: string;
  aiReasoning: string;
  confidenceScore: number;
}

export interface ApplyTrackingResponse {
  isSuccess: boolean;
  message: string;
  data: ApplyTrackingData;
  metadata: string;
}

export interface ApplyTrackingData {
  id: string;
  partCategoryId: string;
  partCategoryName: string;
  partCategoryCode: string;
  instanceIdentifier: string;
  currentPartProductId: string;
  currentPartProductName: string;
  lastReplacementOdometer: number;
  lastReplacementDate: string;
  customKmInterval: number;
  customMonthsInterval: number;
  predictedNextOdometer: number;
  predictedNextDate: string;
  isDeclared: boolean;
  /** Chu kỳ đang hoạt động (API mới); thay cho reminders[] phẳng */
  activeCycle?: TrackingCycleSummary | null;
  /** @deprecated Giữ tương thích nếu BE vẫn trả */
  reminders?: PartTrackingReminder[];
}

export interface VehicleRemindersResponse {
  isSuccess: boolean;
  message: string;
  data: VehicleReminder[];
  metadata: unknown;
}

export interface VehicleReminder {
  id: string;
  trackingCycleId: string;
  level: ReminderLevel;
  status: ReminderDetailStatus;
  currentOdometer: number;
  targetOdometer: number;
  remainingKm: number;
  targetDate: string;
  percentageRemaining: number;
  isNotified: boolean;
  notifiedDate: string | null;
  isDismissed: boolean;
  dismissedDate: string | null;
  partCategory: ReminderPartCategory;
}

export interface ReminderPartCategory {
  id: string;
  name: string;
  code: string;
  /** Một số API trả `slug` (vd. ENGINE-OIL) thay cho hoặc cùng với `code` */
  slug?: string;
  description: string;
  iconUrl: string;
  iconMediaFileId?: string | null;
  identificationSigns: string;
  consequencesIfNotHandled: string;
}

export interface PartCategoryRemindersResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string;
  data: VehicleReminder[];
  metadata: unknown;
}
export const TrackingReminderService = {
  applyTracking: async (userVehicleId: string, payload: ApplyTrackingRequest) => {
    const response = await api8080Service.post<ApplyTrackingResponse>(
      `/api/v1/user-vehicles/${userVehicleId}/apply-tracking`,
      payload,
    );
    return response.data;
  },

  getReminders: async (userVehicleId: string) => {
    const response = await api8080Service.get<VehicleRemindersResponse>(
      `/api/v1/user-vehicles/${userVehicleId}/reminders`,
    );
    return response.data;
  },
};
