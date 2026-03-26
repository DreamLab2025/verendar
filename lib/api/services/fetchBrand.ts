import api8080Service from "@/lib/api/api8080Service";
import { PaginationMetadata } from "../apiService";

// ===== Types =====
export interface Brand {
  id: string;
  name: string;
  vehicleTypeNames: string[]; // có trong response thực tế
  logoUrl: string;
  website: string;
  supportPhone: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BrandListResponse {
  isSuccess: boolean;
  message: string;
  data: Brand[];
  metadata: PaginationMetadata;
}

export interface BrandSingleResponse {
  isSuccess: boolean;
  message: string;
  data: Brand | null;
  metadata: null;
}

export interface BrandBulkResponse {
  isSuccess: boolean;
  message: string;
  data: {
    successCount: number;
    failedCount: number;
    successfulBrands: Brand[];
    errors: Array<{
      index: number;
      itemName: string;
      errorMessage: string;
    }>;
  } | null;
  metadata: null;
}

// Params cho GET danh sách
export type BrandQueryParams = {
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
};

// ===== Service (fetch functions) =====
export const BrandService = {
  // 1. Lấy danh sách thương hiệu phân trang
  getBrands: async (params: BrandQueryParams) => {
    const response = await api8080Service.get<BrandListResponse>("/api/v1/brands", params);
    return response.data;
  },

  // 2. Lấy danh sách thương hiệu theo loại xe
  getBrandsByType: async (typeId: string) => {
    const response = await api8080Service.get<BrandListResponse>("/api/v1/brands", { typeId });
    return response.data;
  },

  // 2b. Chi tiết thương hiệu
  getBrandById: async (id: string) => {
    const response = await api8080Service.get<BrandSingleResponse>(`/api/v1/brands/${id}`);
    return response.data;
  },

  // 3. Tạo mới 1 thương hiệu (Admin)
  createBrand: async (payload: {
    name: string;
    vehicleTypeIds: string[];
    logoUrl?: string;
    website?: string;
    supportPhone?: string;
  }) => {
    const response = await api8080Service.post<BrandSingleResponse>("/api/v1/brands", payload);
    return response.data;
  },

  // 4. Tạo hàng loạt từ JSON (Admin)
  createBrandsBulk: async (payload: {
    brands: Array<{
      name: string;
      vehicleTypeIds: string[];
      logoUrl?: string;
      website?: string;
      supportPhone?: string;
    }>;
  }) => {
    const response = await api8080Service.post<BrandBulkResponse>("/api/v1/brands/bulk", payload);
    return response.data;
  },

  // 5. Upload file JSON để tạo hàng loạt (Admin)
  uploadBrandsBulk: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api8080Service.post<BrandBulkResponse>("/api/v1/brands/bulk/upload", formData);

    return response.data;
  },

  // 6. Cập nhật thương hiệu (Admin)
  updateBrand: async (
    id: string,
    payload: {
      name?: string;
      vehicleTypeIds?: string[];
      logoUrl?: string;
      website?: string;
      supportPhone?: string;
    },
  ) => {
    const response = await api8080Service.put<BrandSingleResponse>(`/api/v1/brands/${id}`, payload);
    return response.data;
  },

  // 7. Xóa thương hiệu (Admin)
  deleteBrand: async (id: string) => {
    const response = await api8080Service.delete<{ message: string }>(`/api/v1/brands/${id}`);
    return response.data;
  },
};
