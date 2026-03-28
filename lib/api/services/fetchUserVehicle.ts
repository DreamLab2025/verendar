/**
 * User Vehicle Service - API calls for user vehicles
 */

import api8080Service from "../api8080Service";

import { BaseQueryParams, PaginationMetadata } from "../apiService";
import { UserVehicleVariant } from "./fetchVariants";
import { TrackingCycleSummary } from "./fetchVehiclePart";

/** POST /api/v1/user-vehicles — body theo contract mới */
export interface CreateUserVehicleRequest {
  vehicleVariantId: string;
  licensePlate: string;
  vin: string;
  /** Chuỗi ngày YYYY-MM-DD */
  purchaseDate: string;
  currentOdometer: number;
}

/** Một item user-vehicle như API trả (create/list có thể dùng `userVehicleVariant` + `vin`) */
export interface UserVehicleApiData {
  id: string;
  userId: string;
  licensePlate: string;
  vin?: string;
  vinNumber?: string;
  nickname?: string | null;
  purchaseDate: string;
  currentOdometer: number;
  lastOdometerUpdate?: string;
  lastOdometerUpdateAt?: string;
  averageKmPerDay: number | null;
  lastCalculatedDate?: string | null;
  createdAt: string;
  updatedAt: string | null;
  variant?: UserVehicleVariant;
  userVehicleVariant?: UserVehicleVariant;
}

export function normalizeUserVehicle(dto: UserVehicleApiData): UserVehicle {
  const variant = dto.variant ?? dto.userVehicleVariant;
  if (!variant) {
    throw new Error("User vehicle response missing variant");
  }
  return {
    id: dto.id,
    userId: dto.userId,
    licensePlate: dto.licensePlate,
    nickname: (dto.nickname ?? "").trim(),
    vinNumber: (dto.vin ?? dto.vinNumber ?? "").trim(),
    purchaseDate: dto.purchaseDate,
    currentOdometer: dto.currentOdometer,
    lastOdometerUpdateAt: dto.lastOdometerUpdateAt ?? dto.lastOdometerUpdate ?? "",
    averageKmPerDay: dto.averageKmPerDay ?? 0,
    lastCalculatedDate: dto.lastCalculatedDate ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    variant: variant as UserVehicleVariant,
  };
}

export interface UserVehicle {
  id: string;
  userId: string;
  licensePlate: string;
  nickname: string;
  vinNumber: string;
  purchaseDate: string;
  currentOdometer: number;
  lastOdometerUpdateAt: string;
  averageKmPerDay: number;
  lastCalculatedDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  variant: UserVehicleVariant;
}
export interface CreateUserVehicleResponse {
  isSuccess: boolean;
  message: string;
  data: UserVehicle;
  metadata: unknown;
}

export interface UserVehicleListResponse {
  isSuccess: boolean;
  message: string;
  data: UserVehicle[];
  metadata: PaginationMetadata;
}

export interface UserVehicleQueryParams extends BaseQueryParams {
  [key: string]: string | number | boolean | null | undefined | string[];
}

export interface DeleteUserVehicleResponse {
  isSuccess: boolean;
  message: string;
  data: string;
  metadata: null;
}

export interface UserVehiclePart {
  id: string;
  partCategoryId: string;
  partCategoryName: string;
  partCategorySlug: string;
  iconUrl: string;
  isDeclared: boolean;
  description: string;
  /** Chu kỳ theo dõi hiện tại; null/undefined nếu chưa khai báo / chưa thiết lập */
  activeCycle?: TrackingCycleSummary | null;
}

// ==================== Odometer Update ====================

// ==================== Odometer History ====================

export const UserVehicleService = {
  // ==================== Vehicle CRUD ====================

  createUserVehicle: async (payload: CreateUserVehicleRequest) => {
    const response = await api8080Service.post<{
      isSuccess: boolean;
      message: string;
      data: UserVehicleApiData;
      metadata: unknown;
    }>("/api/v1/user-vehicles", payload);
    const body = response.data;
    return {
      isSuccess: body.isSuccess,
      message: body.message,
      data: normalizeUserVehicle(body.data),
      metadata: body.metadata,
    } satisfies CreateUserVehicleResponse;
  },

  getUserVehicles: async (params: UserVehicleQueryParams) => {
    const response = await api8080Service.get<{
      isSuccess: boolean;
      message: string;
      data: UserVehicleApiData[];
      metadata: PaginationMetadata;
    }>("/api/v1/user-vehicles", params);
    const body = response.data;
    return {
      isSuccess: body.isSuccess,
      message: body.message,
      data: body.data.map(normalizeUserVehicle),
      metadata: body.metadata,
    } satisfies UserVehicleListResponse;
  },

  deleteUserVehicle: async (id: string) => {
    const response = await api8080Service.delete<DeleteUserVehicleResponse>(`/api/v1/user-vehicles/${id}`);
    return response.data;
  },

  // ==================== Vehicle Parts ====================

  // ==================== AI Analysis ====================

  // ==================== Tracking & Reminders ====================

  // ==================== Odometer ====================
};

export default UserVehicleService;
