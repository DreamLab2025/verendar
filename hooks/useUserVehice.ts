import UserVehicleService, { CreateUserVehicleRequest, CreateUserVehicleResponse, DeleteUserVehicleResponse, UserVehicleListResponse, UserVehicleQueryParams } from "@/lib/api/services/fetchUserVehicle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export function useCreateUserVehicle() {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, data, isPending, isError, error, reset } = useMutation({
    mutationKey: ["user-vehicles"],
    mutationFn: (payload: CreateUserVehicleRequest) => UserVehicleService.createUserVehicle(payload),
    onSuccess: (_data: CreateUserVehicleResponse) => {
      queryClient.invalidateQueries({ queryKey: ["user-vehicles"] });
    },
  });

  return {
    mutate,
    mutateAsync,
    reset,
    isLoading: isPending,
    isError,
    error,
    isSuccess: data?.isSuccess,
    message: data?.message,
    vehicle: data?.data,
    metadata: data?.metadata,
    data,
  };
}

export function useDeleteUserVehicle() {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, isError, error } = useMutation({
    mutationKey: ["delete-user-vehicle"],
    mutationFn: (id: string) => UserVehicleService.deleteUserVehicle(id),
    onSuccess: (data: DeleteUserVehicleResponse) => {
      queryClient.invalidateQueries({ queryKey: ["user-vehicles"] });
      toast.success(data.message || "Xóa xe thành công!");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Xóa xe thất bại!");
    },
  });

  return {
    deleteVehicle: mutate,
    deleteVehicleAsync: mutateAsync,
    isDeleting: isPending,
    isError,
    error,
  };
}

export function useUserVehicles(params: UserVehicleQueryParams, enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["user-vehicles", "list", params],
    queryFn: () => UserVehicleService.getUserVehicles(params),
    enabled,
    select: (data: UserVehicleListResponse) => ({
      vehicles: data.data ?? [],
      metadata: data.metadata,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
  });

  return {
    refetch,
    isLoading,
    isFetching,
    isError,
    error,

    vehicles: data?.vehicles ?? [],
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useUserVehicle(id: string, enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["user-vehicles", "detail", id],
    queryFn: () => UserVehicleService.getUserVehicleById(id),
    enabled: enabled && !!id,
  });

  return {
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
    vehicle: data?.data ?? null,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

