import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandService, BrandQueryParams } from "@/lib/api/services/fetchBrand";

export function useBrands(params: BrandQueryParams, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["brands", "list", params],
    queryFn: () => BrandService.getBrands(params),
    enabled,
    select: (data) => ({
      brands: data.data ?? [],
      metadata: data.metadata,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    brands: data?.brands ?? [],
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useBrandsByType(typeId?: string, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["brands", "by-type", typeId],
    queryFn: () => BrandService.getBrandsByType(typeId as string),
    enabled: !!typeId && enabled,
    select: (data) => ({
      brands: data.data ?? [],
      message: data.message,
      isSuccess: data.isSuccess,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    brands: data?.brands ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: BrandService.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useCreateBrandsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: BrandService.createBrandsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useUploadBrandsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => BrandService.uploadBrandsBulk(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof BrandService.updateBrand>[1] }) =>
      BrandService.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: BrandService.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
