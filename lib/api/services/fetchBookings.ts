import api8080Service from "../api8080Service";
import { PaginationMetadata, RequestParams } from "../apiService";

import type { BookingDetailDto } from "./fetchBooking";

export interface BookingListItemDto {
  id: string;
  status: string;
  scheduledAt: string;
  garageBranchId: string;
  branchName: string;
  itemsSummary: string;
  bookedTotalAmount: number;
  bookedCurrency: string;
}

export interface BookingsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BookingListItemDto[];
  metadata: PaginationMetadata | null;
}

export interface BookingsQueryParams extends RequestParams {
  branchId?: string;
  userId?: string;
  assignedToMe?: boolean;
  status?: string;
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}

export interface BookingDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BookingDetailDto | null;
  metadata: unknown | null;
}

/** PATCH /api/v1/bookings/{id}/assign — Owner/Manager gán thợ (Pending/AwaitingConfirmation → Confirmed) */
export interface AssignBookingPayload {
  garageMemberId: string;
}

/** PATCH /api/v1/bookings/{id}/status — cập nhật trạng thái (vd. InProgress, Completed). */
export interface PatchBookingStatusPayload {
  status: string;
  currentOdometer: number | null;
}

/** Giá trị `status` thường dùng cho PATCH status (theo contract). */
export type PatchBookingStatusValue = "InProgress" | "Completed";

const BookingsService = {
  getBookings: async (params: BookingsQueryParams) => {
    const res = await api8080Service.get<BookingsListResponse>("/api/v1/bookings", params);
    return res.data;
  },

  /** GET /api/v1/bookings/{id} */
  getBookingById: async (id: string) => {
    const res = await api8080Service.get<BookingDetailResponse>(`/api/v1/bookings/${encodeURIComponent(id)}`);
    return res.data;
  },

  /** PATCH /api/v1/bookings/{id}/assign */
  assignBooking: async (bookingId: string, payload: AssignBookingPayload) => {
    const res = await api8080Service.patch<BookingDetailResponse>(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/assign`,
      payload,
    );
    return res.data;
  },

  /** PATCH /api/v1/bookings/{id}/status */
  patchBookingStatus: async (bookingId: string, payload: PatchBookingStatusPayload) => {
    const res = await api8080Service.patch<BookingDetailResponse>(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/status`,
      payload,
    );
    return res.data;
  },
};

export default BookingsService;
