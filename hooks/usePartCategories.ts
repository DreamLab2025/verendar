// src/hooks/usePartCategories.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PartCategoryService, {
  CreatePartCategoryRequest,
  PartCategoryByVehicleIdQueryParams,
  PartCategoryDetailResponse,
  PartCategoryListResponse,
  PartCategoryQueryParams,
  UpdatePartCategoryRequest,
} from "@/lib/api/services/fetchPartCategories";

type UseCategoriesSelected = {
  categories: PartCategoryListResponse["data"];
  metadata: PartCategoryListResponse["metadata"];
  message: PartCategoryListResponse["message"];
  isSuccess: PartCategoryListResponse["isSuccess"];
};

export function usePartCategories(params: PartCategoryQueryParams, enabled = true) {
  const query = useQuery<PartCategoryListResponse, Error, UseCategoriesSelected>({
    queryKey: ["parts", "categories", "list", JSON.stringify(params)],
    queryFn: () => PartCategoryService.getCategories(params),
    enabled: enabled && !!params?.PageNumber && !!params?.PageSize,
    select: (data) => ({
      categories: data.data ?? [],
      metadata: data.metadata,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    categories: query.data?.categories ?? [],
    metadata: query.data?.metadata,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}

export function usePartCategoryById(id: string, enabled = true) {
  const query = useQuery<PartCategoryDetailResponse, Error>({
    queryKey: ["parts", "categories", "detail", id],
    queryFn: () => PartCategoryService.getCategoryById(id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    category: query.data?.data,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}

export function useCreatePartCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePartCategoryRequest) => PartCategoryService.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parts", "categories", "list"] });
    },
  });
}

export function useUpdatePartCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UpdatePartCategoryRequest }) =>
      PartCategoryService.updateCategory(vars.id, vars.payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["parts", "categories", "list"] });
      qc.invalidateQueries({ queryKey: ["parts", "categories", "detail", vars.id] });
    },
  });
}

export function useDeletePartCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PartCategoryService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parts", "categories", "list"] });
    },
  });
}

export function usePartCategoriesByVehicleId(params: PartCategoryByVehicleIdQueryParams, enabled = true) {
  const query = useQuery<PartCategoryListResponse, Error, UseCategoriesSelected>({
    queryKey: ["parts", "categories", "user-vehicle", params.userVehicleId, JSON.stringify(params)],
    queryFn: () => PartCategoryService.getCategoriesByVehicleId(params),
    enabled: enabled && !!params?.userVehicleId && !!params?.PageNumber && !!params?.PageSize,
    select: (response) => ({
      categories: response.data ?? [],
      metadata: response.metadata,
      message: response.message,
      isSuccess: response.isSuccess,
    }),
    staleTime: 30_000,
  });
  return {
    data: query.data,
    categories: query.data?.categories ?? [],
    metadata: query.data?.metadata,
    isLoading: query.isLoading,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
    error: query.error,
    refetch: query.refetch,
  };
}
