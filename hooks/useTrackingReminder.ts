import {
  ApplyTrackingRequest,
  TrackingReminderService,
  VehicleRemindersResponse,
} from "@/lib/api/services/fetchTrackingReminder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useApplyTracking() {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, data, isPending, isError, error, reset } = useMutation({
    mutationKey: ["apply-tracking"],
    mutationFn: ({ userVehicleId, payload }: { userVehicleId: string; payload: ApplyTrackingRequest }) =>
      TrackingReminderService.applyTracking(userVehicleId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-vehicle-parts"] });
      toast.success(data.message || "Áp dụng cấu hình thành công!");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Áp dụng cấu hình thất bại!");
    },
  });

  return {
    apply: mutate,
    applyAsync: mutateAsync,
    reset,
    isApplying: isPending,
    isError,
    error,
    data: data?.data,
    isSuccess: data?.isSuccess,
    message: data?.message,
  };
}

export function useUserVehicleReminders(userVehicleId: string, enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["user-vehicle-reminders", userVehicleId],
    queryFn: () => TrackingReminderService.getReminders(userVehicleId),
    enabled: enabled && !!userVehicleId,
    select: (data: VehicleRemindersResponse) => ({
      reminders: data.data ?? [],
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
    reminders: data?.reminders ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}
