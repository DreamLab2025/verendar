import { UserVehiclePartsResponse, VehiclePartService } from "@/lib/api/services/fetchVehiclePart";
import { useQuery } from "@tanstack/react-query";

export function useUserVehicleParts(userVehicleId: string, enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["user-vehicle-parts", userVehicleId],
    queryFn: () => VehiclePartService.getUserVehicleParts(userVehicleId),
    enabled: enabled && !!userVehicleId,
    select: (data: UserVehiclePartsResponse) => ({
      parts: data.data ?? [],
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
    parts: data?.parts ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}
