/**
 * GET/PATCH/POST — /api/v1/user-vehicles/{vehicleId}/maintenance-proposals/...
 */

import api8080Service from "../api8080Service";
import type { PaginationMetadata, RequestParams } from "../apiService";

export interface MaintenanceProposalLineDto {
  id: string;
  partCategoryId: string;
  garageProductId: string | null;
  garageServiceId: string | null;
  partCategoryName: string;
  itemName: string;
  updatesTracking: boolean;
  recommendedKmInterval: number | null;
  recommendedMonthsInterval: number | null;
  price: number;
}

export interface MaintenanceProposalDto {
  id: string;
  bookingId: string;
  userVehicleId: string;
  branchName: string;
  /** Chuỗi ngày YYYY-MM-DD */
  serviceDate: string;
  odometerAtService: number | null;
  notes: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: MaintenanceProposalLineDto[];
}

export interface MaintenanceProposalsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: MaintenanceProposalDto[];
  metadata: PaginationMetadata | null;
}

export interface MaintenanceProposalsQueryParams extends RequestParams {
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}

/** PATCH body — chỉnh sửa đề xuất trước khi xác nhận */
export interface PatchMaintenanceProposalItemPayload {
  id: string;
  updatesTracking: boolean;
}

export interface PatchMaintenanceProposalPayload {
  odometerAtService: number | null;
  notes: string | null;
  items: PatchMaintenanceProposalItemPayload[];
}

export interface MaintenanceProposalDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: MaintenanceProposalDto;
  metadata: null;
}

export interface MaintenanceProposalApplyResultDto {
  maintenanceRecordId: string;
  serviceDate: string;
  odometerAtService: number;
  trackingUpdated: string[];
}

export interface MaintenanceProposalApplyResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: MaintenanceProposalApplyResultDto;
  metadata: null;
}

function proposalPath(vehicleId: string, proposalId: string) {
  return `/api/v1/user-vehicles/${encodeURIComponent(vehicleId)}/maintenance-proposals/${encodeURIComponent(proposalId)}`;
}

export const MaintenanceProposalService = {
  getList: async (vehicleId: string, params: MaintenanceProposalsQueryParams) => {
    const res = await api8080Service.get<MaintenanceProposalsListResponse>(
      `/api/v1/user-vehicles/${encodeURIComponent(vehicleId)}/maintenance-proposals`,
      params,
    );
    return res.data;
  },

  /** PATCH — chỉnh sửa đề xuất bảo dưỡng trước khi xác nhận */
  patchProposal: async (vehicleId: string, proposalId: string, payload: PatchMaintenanceProposalPayload) => {
    const res = await api8080Service.patch<MaintenanceProposalDetailResponse>(
      proposalPath(vehicleId, proposalId),
      payload,
    );
    return res.data;
  },

  /** POST — xác nhận áp dụng đề xuất (sau khi đã chỉnh PATCH nếu cần) */
  applyProposal: async (vehicleId: string, proposalId: string) => {
    const res = await api8080Service.post<MaintenanceProposalApplyResponse>(
      `${proposalPath(vehicleId, proposalId)}/apply`,
      {},
    );
    return res.data;
  },
};

export default MaintenanceProposalService;
