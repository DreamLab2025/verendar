"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchAndEnrichBookingDetail } from "@/lib/booking/enrich-booking-detail";
import BookingsService from "@/lib/api/services/fetchBookings";

export type BranchBookingsQueryOptions = {
  pageNumber?: number;
  pageSize?: number;
  isDescending?: boolean;
  enabled?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;

/**
 * Danh sách booking theo chi nhánh (Owner/Manager): `branchId` + phân trang.
 */
export function useBranchBookingsQuery(branchId: string | undefined, options?: BranchBookingsQueryOptions) {
  const pageNumber = options?.pageNumber ?? 1;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const isDescending = options?.isDescending;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["bookings", "branch", branchId, pageNumber, pageSize, isDescending],
    queryFn: async () => {
      const body = await BookingsService.getBookings({
        branchId: branchId!,
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(isDescending != null ? { IsDescending: isDescending } : {}),
      });
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được danh sách lịch hẹn.");
      }
      return body;
    },
    enabled: Boolean(branchId) && enabled,
    staleTime: 30_000,
  });
}

/** GET /api/v1/bookings/{id} + tra cứu tên khách, xe, dịch vụ / sản phẩm / combo theo ID. */
export function useBookingDetailEnrichedQuery(bookingId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["bookings", "detail", bookingId, "enriched"],
    queryFn: () => fetchAndEnrichBookingDetail(bookingId!),
    enabled: Boolean(bookingId) && enabled,
    staleTime: 60_000,
  });
}

/** PATCH /api/v1/bookings/{id}/assign — làm mới danh sách chi nhánh + chi tiết đã làm giàu. */
export function useAssignBookingMutation(branchId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, garageMemberId }: { bookingId: string; garageMemberId: string }) => {
      const body = await BookingsService.assignBooking(bookingId, { garageMemberId });
      if (!body.isSuccess) {
        throw new Error(body.message?.trim() || "Không gán được nhân viên.");
      }
      return body;
    },
    onSuccess: (data, variables) => {
      if (branchId) {
        void qc.invalidateQueries({ queryKey: ["bookings", "branch", branchId] });
      }
      void qc.invalidateQueries({ queryKey: ["bookings", "detail", variables.bookingId, "enriched"] });
      toast.success(data.message?.trim() || "Đã gán thợ máy.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gán nhân viên thất bại.");
    },
  });
}
