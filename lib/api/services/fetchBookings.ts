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

/** GET /api/v1/bookings — Owner/Manager: branchId; User: userId; Mechanic: assignedToMe=true */
export interface BookingsQueryParams extends RequestParams {
  branchId?: string;
  userId?: string;
  assignedToMe?: boolean;
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}

export interface BookingDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BookingDetailDto;
  metadata: null;
}

/** PATCH /api/v1/bookings/{id}/assign — Owner/Manager gán thợ (Pending/AwaitingConfirmation → Confirmed) */
export interface AssignBookingPayload {
  garageMemberId: string;
}

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
};

export default BookingsService;
