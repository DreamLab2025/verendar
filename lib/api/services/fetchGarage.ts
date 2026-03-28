import type { PaginationMetadata, RequestParams } from "../apiService";
import api8080Service from "../api8080Service";

export type GarageStatus = string;

export interface GarageDto {
  id: string;
  ownerId: string;
  businessName: string | null;
  slug: string | null;
  shortName: string | null;
  taxCode: string | null;
  logoUrl: string | null;
  status: GarageStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface GarageBranchDto {
  id: string;
  name: string | null;
  slug: string | null;
  address: string | null;
  phoneNumber: string | null;
  latitude: number;
  longitude: number;
  status: string;
}

export interface GarageMeDto extends GarageDto {
  branchCount: number;
  branches: GarageBranchDto[];
}

export interface GaragesListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageDto[];
  metadata: PaginationMetadata | null;
}

export interface GaragesQueryParams extends RequestParams {
  status?: string;
  pageNumber: number;
  pageSize: number;
  isDescending?: boolean;
}

export interface CreateGaragePayload {
  businessName: string;
  shortName: string;
  taxCode: string;
  logoUrl: string;
}

/** Body PUT /api/v1/garages/{id} */
export type UpdateGaragePayload = CreateGaragePayload;

export interface GarageCreateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageDto;
  metadata: null;
}

export interface GarageMeResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageMeDto;
  metadata: null;
}

export type GarageDetailResponse = GarageMeResponse;

export interface GarageUpdateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageDto;
  metadata: null;
}

export interface PatchGarageStatusPayload {
  status: string;
  reason: string;
}

export type GarageStatusPatchResponse = GarageUpdateResponse;

export type GarageResubmitResponse = GarageUpdateResponse;

export interface GarageBusinessLookupDto {
  taxCode: string | null;
  name: string | null;
  internationalName: string | null;
  shortName: string | null;
  address: string | null;
  status: string | null;
}

export interface GarageBusinessLookupResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBusinessLookupDto;
  metadata: null;
}

export interface GarageBranchesQueryParams extends RequestParams {
  pageNumber: number;
  pageSize: number;
  isDescending?: boolean;
}

export interface GarageBranchesListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchDto[];
  metadata: PaginationMetadata | null;
}

/** GET /api/v1/garages/branches/maps — tên query theo BE (PascalCase) */
export interface GarageBranchesMapsQueryParams extends RequestParams {
  Address?: string;
  Lat?: number;
  Lng?: number;
  RadiusKm?: number;
  PageNumber: number;
  PageSize: number;
  isDescending?: boolean;
}

/** Một điểm chi nhánh trên bản đồ */
export interface GarageBranchMapItemDto {
  id: string;
  name: string | null;
  slug: string | null;
  coverImageUrl: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  mapLinks: unknown | null;
  phoneNumber: string | null;
  status: string;
  garage: GarageDto | null;
  averageRating: number | null;
  reviewCount: number;
}

export interface GarageBranchesMapsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchMapItemDto[];
  metadata: PaginationMetadata | null;
}

export interface CreateGarageBranchAddressPayload {
  provinceCode: string;
  wardCode: string;
  houseNumber: string;
  streetDetail: string;
}

/** Lịch làm việc — `schedule` theo schema BE (object tự do) */
export interface CreateGarageBranchWorkingHoursPayload {
  schedule: Record<string, unknown>;
}

/** Body POST /api/v1/garages/{garageId}/branches */
export interface CreateGarageBranchPayload {
  name: string;
  description: string;
  coverImageUrl: string;
  phoneNumber: string;
  taxCode: string;
  address: CreateGarageBranchAddressPayload;
  workingHours: CreateGarageBranchWorkingHoursPayload;
}

/** Body PUT /api/v1/garages/{garageId}/branches/{branchId} — cùng schema với POST */
export type UpdateGarageBranchPayload = CreateGarageBranchPayload;

/** Response POST branch — envelope chuẩn; `data` là chi nhánh vừa tạo (cùng dạng list) */
export interface GarageBranchCreateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchDto;
  metadata: null;
}

/** GET /api/v1/garages/{garageId}/branches/{branchId} */
export interface GarageBranchDetailDto {
  id: string;
  garageId: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  coverImageUrl: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  mapLinks: unknown | null;
  workingHours: unknown | null;
  phoneNumber: string | null;
  taxCode: string | null;
  status: string;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface GarageBranchDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchDetailDto;
  metadata: null;
}

/** PUT branch — `data` là chi nhánh đầy đủ sau cập nhật */
export type GarageBranchUpdateResponse = GarageBranchDetailResponse;

/** DELETE /api/v1/garages/{garageId}/branches/{branchId} */
export interface GarageBranchDeleteResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: boolean;
  metadata: null;
}

/** Body PATCH /api/v1/garages/{garageId}/branches/{branchId}/status */
export interface PatchGarageBranchStatusPayload {
  status: string;
}

/** PATCH branch status — `data` là chi nhánh đầy đủ */
export type GarageBranchStatusPatchResponse = GarageBranchDetailResponse;

export const GarageService = {
  getGarages: async (params: GaragesQueryParams) => {
    const res = await api8080Service.get<GaragesListResponse>("/api/v1/garages", params);
    return res.data;
  },

  getMyGarage: async () => {
    const res = await api8080Service.get<GarageMeResponse>("/api/v1/garages/me");
    return res.data;
  },

  getGarageById: async (id: string) => {
    const res = await api8080Service.get<GarageDetailResponse>(`/api/v1/garages/${id}`);
    return res.data;
  },

  createGarage: async (payload: CreateGaragePayload) => {
    const res = await api8080Service.post<GarageCreateResponse>("/api/v1/garages", payload);
    return res.data;
  },

  updateGarage: async (id: string, payload: UpdateGaragePayload) => {
    const res = await api8080Service.put<GarageUpdateResponse>(`/api/v1/garages/${id}`, payload);
    return res.data;
  },

  patchGarageStatus: async (id: string, payload: PatchGarageStatusPayload) => {
    const res = await api8080Service.patch<GarageStatusPatchResponse>(
      `/api/v1/garages/${id}/status`,
      payload,
    );
    return res.data;
  },

  resubmitGarage: async (id: string) => {
    const res = await api8080Service.patch<GarageResubmitResponse>(`/api/v1/garages/${id}/resubmit`);
    return res.data;
  },

  lookupBusinessByTaxCode: async (taxCode: string) => {
    const encoded = encodeURIComponent(taxCode.trim());
    const res = await api8080Service.get<GarageBusinessLookupResponse>(
      `/api/v1/garages/business-lookup/${encoded}`,
    );
    return res.data;
  },

  getGarageBranches: async (garageId: string, params: GarageBranchesQueryParams) => {
    const res = await api8080Service.get<GarageBranchesListResponse>(
      `/api/v1/garages/${garageId}/branches`,
      params,
    );
    return res.data;
  },

  getGarageBranchesMaps: async (params: GarageBranchesMapsQueryParams) => {
    const res = await api8080Service.get<GarageBranchesMapsListResponse>(
      "/api/v1/garages/branches/maps",
      params,
    );
    return res.data;
  },

  createGarageBranch: async (garageId: string, payload: CreateGarageBranchPayload) => {
    const res = await api8080Service.post<GarageBranchCreateResponse>(
      `/api/v1/garages/${garageId}/branches`,
      payload,
    );
    return res.data;
  },

  getGarageBranchById: async (garageId: string, branchId: string) => {
    const res = await api8080Service.get<GarageBranchDetailResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}`,
    );
    return res.data;
  },

  updateGarageBranch: async (
    garageId: string,
    branchId: string,
    payload: UpdateGarageBranchPayload,
  ) => {
    const res = await api8080Service.put<GarageBranchUpdateResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}`,
      payload,
    );
    return res.data;
  },

  deleteGarageBranch: async (garageId: string, branchId: string) => {
    const res = await api8080Service.delete<GarageBranchDeleteResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}`,
    );
    return res.data;
  },

  patchGarageBranchStatus: async (
    garageId: string,
    branchId: string,
    payload: PatchGarageBranchStatusPayload,
  ) => {
    const res = await api8080Service.patch<GarageBranchStatusPatchResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}/status`,
      payload,
    );
    return res.data;
  },
};

export default GarageService;
