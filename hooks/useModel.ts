import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ModelService, {
  CreateModelRequest,
  ModelDetailResponse,
  ModelListResponse,
  ModelQueryParams,
  UpdateModelRequest,
} from "@/lib/api/services/fetchModel";

type UseModelsSelected = {
  models: ModelListResponse["data"];
  metadata: ModelListResponse["metadata"];
  message: ModelListResponse["message"];
  isSuccess: ModelListResponse["isSuccess"];
};

export function useModels(params: ModelQueryParams, enabled: boolean = true) {
  const query = useQuery<ModelListResponse, Error, UseModelsSelected>({
    queryKey: ["models", "list", JSON.stringify(params)],
    queryFn: () => ModelService.getModels(params),
    enabled: enabled && !!params?.PageNumber && !!params?.PageSize,
    select: (data) => ({
      models: data.data ?? [],
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

    models: query.data?.models ?? [],
    metadata: query.data?.metadata,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}
export function useModelById(id: string, enabled: boolean = true) {
  const query = useQuery<ModelDetailResponse, Error>({
    queryKey: ["models", "detail", id],
    queryFn: () => ModelService.getModelById(id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    model: query.data?.data,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}

export function useCreateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModelRequest) => ModelService.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models", "list"] });
    },
  });
}

export function useUpdateModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModelRequest }) => ModelService.updateModel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["models", "list"] });
      queryClient.invalidateQueries({ queryKey: ["models", "detail", variables.id] });
    },
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ModelService.deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models", "list"] });
    },
  });
}
