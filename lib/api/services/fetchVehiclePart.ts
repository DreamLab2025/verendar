import api8080Service from "../api8080Service";
import { UserVehiclePart } from "./fetchUserVehicle";
import { UserVehicleVariant } from "./fetchVariants";

export type TrackingCycleStatus = "Active" | "Completed";
export type ReminderDetailStatus = "Active" | "Passed" | "Resolved";

export interface UserVehiclePartsResponse {
  isSuccess: boolean;
  message: string;
  data: UserVehiclePart[];
  metadata: unknown;
}

export interface TrackingCycleSummary {
  id: string;
  status: TrackingCycleStatus;
  startOdometer: number;
  startDate: string;
  targetOdometer: number;
  targetDate: string;
  reminders: PartTrackingReminder[];
}



export interface PartTrackingReminder {
  id: string;
  level: string;
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
}

interface PartTrackingCyclesResponse {
  isSuccess: boolean;
  message: string;
  data: TrackingCycleSummary[];
  metadata: unknown;
}

export const VehiclePartService = {
  getUserVehicleParts: async (userVehicleId: string) => {
    const response = await api8080Service.get<UserVehiclePartsResponse>(`/api/v1/user-vehicles/${userVehicleId}/parts`);
    return response.data;
  },

  getPartTrackingCycles: async (userVehicleId: string, partTrackingId: string) => {
    const response = await api8080Service.get<PartTrackingCyclesResponse>(
      `/api/v1/user-vehicles/${userVehicleId}/parts/${partTrackingId}/cycles`,
    );
    return response.data;
  },
};
