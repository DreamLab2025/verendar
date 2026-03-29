import { PaginationMetadata, RequestParams } from "../apiService";

import api8080Service from "../api8080Service";
import { ReminderLevel } from "./fetchTrackingReminder";

export type NotificationType = "reminder" | "maintenance" | "system" | "promotion" | "odometer_update";

export interface NotificationQueryParams extends RequestParams {
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
  /** Lọc chưa đọc (`false`) / đã đọc (`true`) — tùy BE có bật filter trên list */
  isRead?: boolean;
}

export interface MarkAllAsReadResponse {
  isSuccess: boolean;
  message: string;
  data: number; // Number of notifications marked as read
  metadata: string | null;
}


export interface InAppNotificationPayload {
  title: string;
  message: string;
  metadata: Record<string, unknown>;
}
export interface MarkAsReadResponse {
  isSuccess: boolean;
  message: string;
  data: boolean;
  metadata: null;
}

export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  priority: string;
  status: string;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  /** List thường trả `null` — chi tiết mới có đủ (theo OVERVIEW) */
  maintenanceItems?: unknown[] | null;
}

export interface ApiNotificationDetail extends ApiNotification {
  metadata: NotificationMetadata;
}

export interface MaintenanceReminderMetadata {
  type: "MaintenanceReminder";
  entityId: string;
  entityType: "MaintenanceReminder";
  level: number;
  levelName: "Critical" | "High" | "Medium" | "Low" | "Normal" | "Warning";
  items: Array<{
    reminderId: string;
    userVehicleId: string;
    targetOdometer: number;
    currentOdometer: number;
    initialOdometer: number;
    partCategoryName: string;
    vehicleDisplayName: string;
    percentageRemaining: number;
    estimatedNextReplacementDate?: string;
  }>;
}

export interface OdometerReminderMetadata {
  type: "OdometerReminder";
  entityId: string;
  entityType: "OdometerReminder";
  staleOdometerDays: number;
  vehicles: Array<{
    licensePlate: string;
    userVehicleId: string;
    currentOdometer: number;
    daysSinceUpdate: number;
    vehicleDisplayName: string;
    lastOdometerUpdateFormatted: string;
  }>;
}

export type NotificationMetadata = OdometerReminderMetadata | MaintenanceReminderMetadata | Record<string, unknown>;

export interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
}

export interface NotificationListProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
}

export interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  level?: ReminderLevel;
  partName?: string;
  vehicleName?: string;
  vehicleId?: string;
  userVehicleId?: string;
  reminderId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface NotificationDetailResponse {
  isSuccess: boolean;
  message: string;
  data: ApiNotificationDetail;
  metadata: null;
}

export interface NotificationListResponse {
  isSuccess: boolean;
  message: string;
  data: ApiNotification[];
  metadata: PaginationMetadata;
}

export interface NotificationStatus {
  unReadCount: number;
  hasUnread: boolean;
}

export interface NotificationStatusResponse {
  isSuccess: boolean;
  message: string;
  data: NotificationStatus;
  metadata: null;
}
export interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onViewAll?: () => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationService = {
  getNotificationStatus: async () => {
    const response = await api8080Service.get<NotificationStatusResponse>("/api/v1/notifications/status");
    return response.data;
  },

  getNotifications: async (params: NotificationQueryParams) => {
    const response = await api8080Service.get<NotificationListResponse>("/api/v1/notifications", params);
    return response.data;
  },

  getNotificationById: async (id: string) => {
    const response = await api8080Service.get<NotificationDetailResponse>(`/api/v1/notifications/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api8080Service.post<MarkAllAsReadResponse>("/api/v1/notifications/read-all");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api8080Service.post<MarkAsReadResponse>(`/api/v1/notifications/${id}/read`);
    return response.data;
  },
};

export default NotificationService;
