import {
  OdometerHistoryQueryParams,
  OdometerHistoryResponse,
  OdometerService,
  UpdateOdometerRequest,
} from "@/lib/api/services/fetchOdometer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateOdometer() {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, data, isPending, isError, error, reset } = useMutation({
    mutationKey: ["update-odometer"],
    mutationFn: ({ userVehicleId, payload }: { userVehicleId: string; payload: UpdateOdometerRequest }) =>
      OdometerService.updateOdometer(userVehicleId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["user-vehicle", "odometer-history", variables.userVehicleId],
      });
      queryClient.invalidateQueries({ queryKey: ["user-vehicle-parts", variables.userVehicleId] });
      toast.success(data.message || "Cập nhật số km thành công!");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Cập nhật số km thất bại!");
    },
  });

  return {
    updateOdometer: mutate,
    updateOdometerAsync: mutateAsync,
    reset,
    isUpdating: isPending,
    isError,
    error,
    vehicle: data?.data,
    isSuccess: data?.isSuccess,
    message: data?.message,
  };
}

export function useOdometerHistory(
  userVehicleId: string | undefined,
  params: OdometerHistoryQueryParams,
  enabled: boolean = true,
) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["user-vehicle", "odometer-history", userVehicleId, params],
    queryFn: () => OdometerService.getOdometerHistory(userVehicleId!, params),
    enabled: enabled && !!userVehicleId,
    select: (data: OdometerHistoryResponse) => ({
      history: data.data ?? [],
      metadata: data.metadata,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh fetch
  });

  return {
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
    history: data?.history ?? [],
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useScanOdometer() {
  const { mutate, mutateAsync, data, isPending, isError, error, reset } = useMutation({
    mutationKey: ["scan-odometer"],
    mutationFn: (image: File) => OdometerService.scanOdometer(image),
    onError: (err: Error) => {
      toast.error(err?.message || "Nhận diện ODO thất bại!");
    },
  });

  return {
    scan: mutate,
    scanAsync: mutateAsync,
    reset,
    isScanning: isPending,
    isError,
    error,
    scanResult: data?.data,
    isSuccess: data?.isSuccess,
    message: data?.message,
  };
}
