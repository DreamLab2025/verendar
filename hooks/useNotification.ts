import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import NotificationService, { ApiNotification, InAppNotificationPayload, MarkAsReadResponse, NotificationDetailResponse, NotificationListResponse, NotificationQueryParams, NotificationStatusResponse, NotificationType } from "@/lib/api/services/fetchNotification";

import notificationHubService from "@/hubs/notificationHub";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { ReminderLevel } from "@/lib/api/services/fetchTrackingReminder";
import { Notification } from "@/lib/api/services/fetchNotification";



export function useNotificationStatus(enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["notifications", "status"],
    queryFn: () => NotificationService.getNotificationStatus(),
    enabled,
    select: (data: NotificationStatusResponse) => ({
      unReadCount: data.data?.unReadCount ?? 0,
      hasUnread: data.data?.hasUnread ?? false,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
    unReadCount: data?.unReadCount ?? 0,
    hasUnread: data?.hasUnread ?? false,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useInvalidateNotificationStatus() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "status"] });
  };
}

export function useNotifications(params: NotificationQueryParams, enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: () => NotificationService.getNotifications(params),
    enabled,
    select: (data: NotificationListResponse) => ({
      notifications: data.data?.map(mapApiNotificationToNotification) ?? [],
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
    notifications: data?.notifications ?? [],
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function mapApiNotificationToNotification(apiNotif: ApiNotification): Notification {

  let type: NotificationType = "system";
  if (apiNotif.entityType === "MaintenanceReminder") {
    type = "reminder";
  } else if (apiNotif.entityType === "OdometerReminder") {
    type = "odometer_update";
  }
  const level = type === "reminder" ? (apiNotif.priority as ReminderLevel) : undefined;
  const reminderId = type === "reminder" ? apiNotif.entityId : undefined;
  const userVehicleId = type === "odometer_update" ? apiNotif.entityId : undefined;
  const vehicleId = type === "odometer_update" ? apiNotif.entityId : undefined;

  return {
    id: apiNotif.id ,
    type,
    title: apiNotif.title,
    message: apiNotif.message,
    level,
    reminderId,
    vehicleId,
    userVehicleId,
    isRead: apiNotif.isRead,
    createdAt: apiNotif.createdAt,
    actionUrl: apiNotif.actionUrl || undefined,
  };
}

export function useNotificationById(id: string | undefined, enabled: boolean = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["notifications", "detail", id],
    queryFn: () => NotificationService.getNotificationById(id!),
    enabled: enabled && !!id,
    select: (data: NotificationDetailResponse) => ({
      notification: mapApiNotificationToNotification(data.data),
      detail: data.data,
      metadata: data.data.metadata,
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
    notification: data?.notification,
    detail: data?.detail,
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useNotificationListener() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    // Handler for incoming notifications
    const handleNotification = (...args: unknown[]) => {
      const payload = args[0] as InAppNotificationPayload;
      console.log("📬 Received notification:", payload);

      // Show toast notification
      if (payload?.title && payload?.message) {
        toast.info(payload.title, {
          description: payload.message,
        });
      }

      // Invalidate notification status and list to refresh
      queryClient.invalidateQueries({ queryKey: ["notifications", "status"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    };

    // Get current connection state
    const connectionState = notificationHubService.getConnectionState();

    if (connectionState.isConnected && connectionState.connection) {
      // Already connected, just subscribe
      notificationHubService.on("Notification", handleNotification);
      console.log("📥 Subscribed to 'Notification' method (already connected)");
    } else if (connectionState.isConnecting) {
      // Connection in progress, wait a bit and try again
      const timeout = setTimeout(() => {
        const newState = notificationHubService.getConnectionState();
        if (newState.isConnected) {
          notificationHubService.on("Notification", handleNotification);
          console.log("📥 Subscribed to 'Notification' method (after connection)");
        } else {
          // Start connection with callback if still not connected
          notificationHubService.startConnection(accessToken, handleNotification).then((connected) => {
            if (connected) {
              console.log("✅ Notification hub connected and subscribed!");
            }
          });
        }
      }, 1000);

      return () => {
        clearTimeout(timeout);
        notificationHubService.off("Notification", handleNotification);
      };
    } else {
      // Not connected yet, start connection with callback
      notificationHubService.startConnection(accessToken, handleNotification).then((connected) => {
        if (connected) {
          console.log("✅ Notification hub connected and subscribed!");
        }
      });
    }

    // Cleanup: unsubscribe on unmount
    return () => {
      notificationHubService.off("Notification", handleNotification);
    };
  }, [accessToken, queryClient]);
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: (data) => {
      // Invalidate notification status and list to refresh
      queryClient.invalidateQueries({ queryKey: ["notifications", "status"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });

      if (data.isSuccess) {
        toast.success(`Đã đánh dấu ${data.data} thông báo là đã đọc`);
      } else {
        toast.error(data.message || "Không thể đánh dấu tất cả thông báo");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể đánh dấu tất cả thông báo");
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: (data: MarkAsReadResponse) => {
      // Invalidate notification status, list, and detail to refresh
      queryClient.invalidateQueries({ queryKey: ["notifications", "status"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "detail"] });
    },
    onError: (error: Error) => {
      // Silently fail - don't show error toast for mark as read
      console.error("Failed to mark notification as read:", error);
    },
  });
}
