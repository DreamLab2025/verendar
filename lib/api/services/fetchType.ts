import api8080Service from "../api8080Service";
import { PaginationMetadata, RequestParams } from "../apiService";

export interface VehicleType {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TypeListResponse {
  isSuccess: boolean;
  message: string;
  data: VehicleType[];
  metadata: PaginationMetadata;
}

export interface TypeQueryParams extends RequestParams {
  PageNumber?: number;
  PageSize?: number;
  IsDescending?: boolean;
}

export interface TypeCreatePayload {
  name: string;
  description: string;
}

export interface TypeUpdatePayload {
  name: string;
  description: string;
}

export interface TypeSingleResponse {
  isSuccess: boolean;
  message: string;
  data: VehicleType;
  metadata: null;
}
// fetchType.ts (hoặc types chung)

export interface TypeDeleteResponse {
  isSuccess: boolean;
  message: string;
  data: string; // id đã bị xóa, hoặc message backend
}
export const TypeService = {
  getTypes: async (params: TypeQueryParams) => {
    const response = await api8080Service.get<TypeListResponse>("/api/v1/types", params);
    return response.data;
  },

  getTypeById: async (id: string) => {
    const response = await api8080Service.get<TypeSingleResponse>(`/api/v1/types/${id}`);
    return response.data;
  },
  createType: async (payload: TypeCreatePayload) => {
    const response = await api8080Service.post<TypeSingleResponse>("/api/v1/types", payload);
    return response.data;
  },

  updateType: async (id: string, payload: TypeUpdatePayload) => {
    const response = await api8080Service.put<TypeSingleResponse>(`/api/v1/types/${id}`, payload);
    return response.data;
  },

  deleteType: async (id: string) => {
    const response = await api8080Service.delete<TypeDeleteResponse>(`/api/v1/types/${id}`);
    return response.data;
  },
};

export default TypeService;
