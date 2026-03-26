import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import VariantService, {
  CreateVariantRequest,
  UpdateVariantRequest,
  UseVariantsSelected,
  VariantListResponse,
  VehicleVariant,
} from "@/lib/api/services/fetchVariants";



export function useVariantsByModelId(vehicleModelId: string, enabled: boolean = true) {
  const query = useQuery<VariantListResponse, Error, UseVariantsSelected>({
    queryKey: ["variants", "byModel", vehicleModelId],
    queryFn: () => VariantService.getVariantsByModelId(vehicleModelId),
    enabled: enabled && !!vehicleModelId,
    select: (data) => ({
      variants: data.data ?? [],
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

    variants: query.data?.variants ?? [],
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}

/** Create */
export function useCreateVariant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVariantRequest) => VariantService.createVariant(payload),
    onSuccess: (_, variables) => {
      // refresh list theo modelId
      qc.invalidateQueries({ queryKey: ["variants", "byModel", variables.vehicleModelId] });
      // nếu bạn đang hiển thị models list/detail có variants trong đó → invalidate luôn
      qc.invalidateQueries({ queryKey: ["models", "list"] });
      qc.invalidateQueries({ queryKey: ["models", "detail", variables.vehicleModelId] }); // optional (nếu detail route dùng modelId)
    },
  });
}

/** Update */
export function useUpdateVariant(vehicleModelId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVariantRequest }) =>
      VariantService.updateVariant(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["variants", "byModel", vehicleModelId] });
      qc.invalidateQueries({ queryKey: ["models", "list"] });
    },
  });
}

/** Delete */
export function useDeleteVariant(vehicleModelId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => VariantService.deleteVariant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["variants", "byModel", vehicleModelId] });
      qc.invalidateQueries({ queryKey: ["models", "list"] });
    },
  });
}
