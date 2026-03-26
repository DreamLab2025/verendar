import api8080Service from "../api8080Service";
import { BaseQueryParams, PaginationMetadata } from "../apiService";
import { UserVehicle } from "./fetchUserVehicle";

export interface UpdateOdometerRequest {
  currentOdometer: number;
}

export interface UpdateOdometerResponse {
  isSuccess: boolean;
  message: string;
  data: UserVehicle;
  metadata: string;
}

export interface OdometerHistoryQueryParams extends BaseQueryParams {
  FromDate?: string; // ISO date string (YYYY-MM-DD)
  ToDate?: string; // ISO date string (YYYY-MM-DD)
  [key: string]: string | number | boolean | null | undefined | string[];
}

export interface OdometerHistoryResponse {
  isSuccess: boolean;
  message: string;
  data: OdometerHistoryItem[];
  metadata: PaginationMetadata;
}

export interface OdometerHistoryItem {
  id: string;
  userVehicleId: string;
  odometerValue: number;
  recordedDate: string; // ISO date string (YYYY-MM-DD)
  kmOnRecordedDate: number;
  source: "ManualInput" | (string & {});
}

export interface ScanOdometerData {
  odometerValue: number;
  confidence: number;
  rawText: string;
  imageUrl?: string;
}

export interface ScanOdometerResponse {
  isSuccess: boolean;
  message: string;
  data: ScanOdometerData;
  metadata: string;
}

export const OdometerService = {
  updateOdometer: async (userVehicleId: string, payload: UpdateOdometerRequest) => {
    const response = await api8080Service.patch<UpdateOdometerResponse>(
      `/api/v1/odometer-history/${userVehicleId}`,
      payload,
    );
    return response.data;
  },

  scanOdometer: async (image: File, onProgress?: (percent: number) => void) => {
    const response = await api8080Service.upload<ScanOdometerResponse>(
      "/api/v1/ai/odometer/scan",
      image,
      "image",
      undefined,
      onProgress,
    );
    return response.data;
  },

  getOdometerHistory: async (userVehicleId: string, params: OdometerHistoryQueryParams) => {
    const response = await api8080Service.get<OdometerHistoryResponse>(`/api/v1/odometer-history`, {
      ...params,
      userVehicleId,
    });
    return response.data;
  },
};
