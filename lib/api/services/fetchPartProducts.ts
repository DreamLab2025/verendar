/** ===== Types (match API response) ===== */
import api8080Service from "../api8080Service";
import type { ApiItemResponse, ApiListResponse, ApiMutationResponse, PaginationMetadata, RequestParams } from "../apiService";

export interface PartProduct {
  id: string;
  partCategoryId: string;
  partCategoryName: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string | null;
  referencePrice: number;
  recommendedKmInterval: number;
  recommendedMonthsInterval: number;
  createdAt: string;
  updatedAt: string | null;
}

export type UseProductsSelected = {
  products: PartProduct[];
  message: string;
  isSuccess: boolean;
  metadata: PaginationMetadata | null;
};



/** Nếu backend CHƯA có paging/sort cho list by category thì cứ để optional */
export interface PartProductListByCategoryParams extends RequestParams {
  CategoryId: string; // uuid
  PageNumber?: number;
  PageSize?: number;
  IsDescending?: boolean;
}

export interface CreatePartProductRequest {
  partCategoryId: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string | null;
  referencePrice: number;
  recommendedKmInterval: number;
  recommendedMonthsInterval: number;
}

export interface UpdatePartProductRequest {
  partCategoryId: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string | null;
  referencePrice: number;
  recommendedKmInterval: number;
  recommendedMonthsInterval: number;
}

/** ===== Service ===== */
export const PartProductService = {
  /** GET /api/v1/part-products/category/{categoryId} */
  getProductsByCategory: async (categoryId: string, params?: { PageNumber?: number; PageSize?: number; IsDescending?: boolean }) => {
    const queryParams: Record<string, string> = {};
    if (params?.PageNumber !== undefined) {
      queryParams.PageNumber = params.PageNumber.toString();
    }
    if (params?.PageSize !== undefined) {
      queryParams.PageSize = params.PageSize.toString();
    }
    if (params?.IsDescending !== undefined) {
      queryParams.IsDescending = params.IsDescending.toString();
    }
    
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `/api/v1/part-products/category/${categoryId}${queryString ? `?${queryString}` : ""}`;
    
    const res = await api8080Service.get<ApiListResponse<PartProduct>>(url);
    return res.data;
  },

  /** GET /api/v1/part-products/{id} */
  getProductById: async (id: string) => {
    const res = await api8080Service.get<ApiItemResponse<PartProduct>>(
      `/api/v1/part-products/${id}`,
    );
    return res.data;
  },

  /** POST /api/v1/part-products */
  createProduct: async (payload: CreatePartProductRequest) => {
    const res = await api8080Service.post<ApiMutationResponse<PartProduct>>(
      "/api/v1/part-products",
      payload,
    );
    return res.data;
  },

  /** PUT /api/v1/part-products/{id} */
  updateProduct: async (id: string, payload: UpdatePartProductRequest) => {
    const res = await api8080Service.put<ApiMutationResponse<PartProduct>>(
      `/api/v1/part-products/${id}`,
      payload,
    );
    return res.data;
  },

  /** DELETE /api/v1/part-products/{id} */
  deleteProduct: async (id: string) => {
    const res = await api8080Service.delete<ApiMutationResponse<null>>(
      `/api/v1/part-products/${id}`,
    );
    return res.data;
  },
};

export default PartProductService;
