import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TypeService, {
  TypeCreatePayload,
  TypeDeleteResponse,
  TypeListResponse,
  TypeQueryParams,
  TypeSingleResponse,
  TypeUpdatePayload,
} from "@/lib/api/services/fetchType";
import { ApiError } from "@/lib/api/apiService";
import { toast } from "sonner";

export function useTypes(params: TypeQueryParams, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["types", "list", params],
    queryFn: () => TypeService.getTypes(params),
    enabled,
    select: (data: TypeListResponse) => ({
      types: data.data ?? [],
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
    types: data?.types ?? [],
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

// export function useType(typeId?: string) {
//   return useQuery({
//     queryKey: ["types", "detail", typeId],
//     queryFn: () => TypeService.getTypeById(typeId!),
//     enabled: !!typeId,
//     select: (response: TypeSingleResponse) => ({
//       type: response.data,
//       message: response.message,
//       isSuccess: response.isSuccess,
//     }),
//   });
// }

export function useCreateType() {
  const queryClient = useQueryClient();

  return useMutation<TypeSingleResponse, ApiError, TypeCreatePayload>({
    mutationFn: (payload) => TypeService.createType(payload),
    onSuccess: (data) => {
      if (data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ["types", "list"] });
        toast.success(data.message || "Tạo loại xe thành công");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Tạo loại xe thất bại");
    },
  });
}

export function useUpdateType() {
  const queryClient = useQueryClient();

  return useMutation<TypeSingleResponse, ApiError, { id: string; payload: TypeUpdatePayload }>({
    mutationFn: ({ id, payload }) => TypeService.updateType(id, payload),
    onSuccess: (data) => {
      if (data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ["types", "list"] });
        queryClient.invalidateQueries({ queryKey: ["types", "detail"] });
        toast.success(data.message || "Cập nhật loại xe thành công");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật loại xe thất bại");
    },
  });
}

export function useDeleteType() {
  const queryClient = useQueryClient();

  return useMutation<TypeDeleteResponse, ApiError, string>({
    mutationFn: (typeId) => TypeService.deleteType(typeId),
    onSuccess: (data) => {
      if (data.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ["types", "list"] });
        toast.success(data.message || "Xóa loại xe thành công");
      } else {
        toast.error(data.message || "Xóa loại xe thất bại");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Xóa loại xe thất bại");
    },
  });
}
