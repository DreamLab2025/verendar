// src/lib/api/services/fetchPartCategories.ts
import api8080Service from "../api8080Service";
import { PaginationMetadata, RequestParams } from "../apiService";

export interface PartCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  iconUrl: string | null;
  displayOrder: number;
  requiresOdometerTracking: boolean;
  requiresTimeTracking: boolean;
  allowsMultipleInstances: boolean;
  identificationSigns: string;
  consequencesIfNotHandled: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PartCategoryListResponse {
  isSuccess: boolean;
  message: string;
  data: PartCategory[];
  metadata: PaginationMetadata;
}

export interface PartCategoryDetailResponse {
  isSuccess: boolean;
  message: string;
  data: PartCategory;
  metadata: null;
}

export interface PartCategoryMutationResponse {
  isSuccess: boolean;
  message: string;
  data: PartCategory | string | null; // create/update trả PartCategory, delete trả "Deleted"
  metadata: null;
}

export interface PartCategoryQueryParams extends RequestParams {
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}

export interface PartCategoryByVehicleIdQueryParams extends PartCategoryQueryParams {
  userVehicleId: string;
}
export interface CreatePartCategoryRequest {
  name: string;
  code: string;
  description: string;
  iconUrl: string;
  displayOrder: number;
  requiresOdometerTracking: boolean;
  requiresTimeTracking: boolean;
  allowsMultipleInstances: boolean;
  identificationSigns: string;
  consequencesIfNotHandled: string;
}

export type UpdatePartCategoryRequest = CreatePartCategoryRequest;

export const PartCategoryService = {
  getCategories: async (params: PartCategoryQueryParams) => {
    const res = await api8080Service.get<PartCategoryListResponse>("/api/v1/part-categories", params);
    return res.data;
  },

  getCategoryById: async (id: string) => {
    const res = await api8080Service.get<PartCategoryDetailResponse>(`/api/v1/part-categories/${id}`);
    return res.data;
  },

  getCategoriesByVehicleId: async (params: PartCategoryByVehicleIdQueryParams) => {
    const res = await api8080Service.get<PartCategoryListResponse>(`/api/v1/part-categories/`, { ...params });
    return res.data;
  },

  /** Danh mục phụ tùng áp dụng cho một model xe (thay endpoint default-schedule cũ) */
  getCategoriesByVehicleModelId: async (modelId: string) => {
    const res = await api8080Service.get<PartCategoryListResponse>(`/api/v1/vehicle-models/${modelId}/part-categories`);
    return res.data;
  },

  createCategory: async (payload: CreatePartCategoryRequest) => {
    const res = await api8080Service.post<PartCategoryMutationResponse>("/api/v1/part-categories", payload);
    return res.data;
  },

  updateCategory: async (id: string, payload: UpdatePartCategoryRequest) => {
    const res = await api8080Service.put<PartCategoryMutationResponse>(`/api/v1/part-categories/${id}`, payload);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await api8080Service.delete<PartCategoryMutationResponse>(`/api/v1/part-categories/${id}`);
    return res.data;
  },
};

export default PartCategoryService;
