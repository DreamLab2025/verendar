import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PartProductService, {
  CreatePartProductRequest,
  PartProduct,
  UpdatePartProductRequest,
  UseProductsSelected,
} from "@/lib/api/services/fetchPartProducts";
import { ApiItemResponse, ApiListResponse, PaginationMetadata } from "@/lib/api/apiService";

export function useProductsByCategory(
  categoryId: string,
  enabled = true,
  pagination?: { pageNumber: number; pageSize: number; isDescending?: boolean },
) {
  const query = useQuery<ApiListResponse<PartProduct>, Error, UseProductsSelected>({
    queryKey: [
      "part-products",
      "by-category",
      categoryId,
      pagination?.pageNumber,
      pagination?.pageSize,
      pagination?.isDescending,
    ],
    queryFn: () =>
      PartProductService.getProductsByCategory(categoryId, {
        PageNumber: pagination?.pageNumber,
        PageSize: pagination?.pageSize,
        IsDescending: pagination?.isDescending,
      }),
    enabled: enabled && !!categoryId,
    select: (data) => ({
      products: data.data ?? [],
      message: data.message,
      isSuccess: data.isSuccess,
      metadata:
        typeof data.metadata === "object" && data.metadata !== null && "pageNumber" in data.metadata
          ? (data.metadata as PaginationMetadata)
          : null,
    }),
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    products: query.data?.products ?? [],
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
    metadata: query.data?.metadata ?? null,
  };
}

export function useProductById(id: string, enabled = true) {
  const query = useQuery<ApiItemResponse<PartProduct>, Error>({
    queryKey: ["part-products", "detail", id],
    queryFn: () => PartProductService.getProductById(id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    product: query.data?.data,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePartProductRequest) => PartProductService.createProduct(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["part-products", "by-category", variables.partCategoryId] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload: UpdatePartProductRequest }) =>
      PartProductService.updateProduct(args.id, args.payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["part-products", "detail", variables.id] });
      qc.invalidateQueries({ queryKey: ["part-products", "by-category", variables.payload.partCategoryId] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; categoryId: string }) => PartProductService.deleteProduct(args.id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["part-products", "by-category", variables.categoryId] });
    },
  });
}
