"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchAndEnrichBookingDetail } from "@/lib/booking/enrich-booking-detail";
import BookingsService, {
  type BookingListItemDto,
  type PatchBookingStatusPayload,
} from "@/lib/api/services/fetchBookings";
import type { RequestParams } from "@/lib/api/apiService";
import { flattenInfinitePages, useInfinityScroll } from "@/hooks/useInfinityScroll";
import type { ApiResponse } from "@/types/api";

export { flattenInfinitePages };

export type BranchBookingsQueryOptions = {
  pageNumber?: number;
  pageSize?: number;
  isDescending?: boolean;
  /** Lọc theo trạng thái — gửi lên GET /api/v1/bookings?status=… */
  status?: string;
  enabled?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;

type BranchBookingsInfiniteFilters = RequestParams & {
  branchId?: string;
};

export type BranchBookingsScrollInfinityOptions = {
  pageSize?: number;
  isDescending?: boolean;
  status?: string;
  /**
   * Mechanic: chỉ lấy booking gán cho mình — gửi `assignedToMe=true`.
   * Khi bật thì **không** gửi `branchId` lên API (chỉ cần một trong hai cách lọc).
   */
  assignedToMe?: boolean;
  enabled?: boolean;
  scrollOffset?: number;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
};

/**
 * Danh sách booking theo chi nhánh — infinite scroll (GET /api/v1/bookings), dựa trên {@link useInfinityScroll}.
 */
export function useBranchBookingsScrollInfinity(
  branchId: string | undefined,
  options?: BranchBookingsScrollInfinityOptions,
) {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const isDescending = options?.isDescending;
  const status = options?.status;
  const assignedToMe = options?.assignedToMe;
  const enabled = options?.enabled ?? true;

  const hasBranch = branchId != null && branchId !== "";

  const filters: BranchBookingsInfiniteFilters | undefined = (() => {
    const sortAndStatus = {
      ...(isDescending != null ? { IsDescending: isDescending } : {}),
      ...(status != null && status !== "" ? { status } : {}),
    };
    if (assignedToMe === true) {
      return { assignedToMe: true, ...sortAndStatus };
    }
    if (hasBranch) {
      return { branchId, ...sortAndStatus };
    }
    return undefined;
  })();

  const scopeKey = assignedToMe === true ? "assigned-to-me" : branchId ?? "";

  return useInfinityScroll<BookingListItemDto, BranchBookingsInfiniteFilters>({
    queryKey: ["bookings", "branch", "infinite", scopeKey],
    filters,
    enabled: enabled && (assignedToMe === true || hasBranch),
    pageSize,
    scrollOffset: options?.scrollOffset,
    staleTime: options?.staleTime ?? 30_000,
    gcTime: options?.gcTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    refetchOnMount: options?.refetchOnMount,
    refetchOnReconnect: options?.refetchOnReconnect,
    errorMessage: "Không tải được danh sách lịch hẹn.",
    fetchPage: async (params) => {
      const { pageNumber, pageSize: ps, branchId: bid, ...rest } = params;
      const byMe = rest.assignedToMe === true;
      const body = await BookingsService.getBookings({
        ...(byMe
          ? {}
          : bid != null && bid !== ""
            ? { branchId: bid }
            : {}),
        PageNumber: pageNumber,
        PageSize: ps,
        ...(typeof rest.IsDescending === "boolean" ? { IsDescending: rest.IsDescending } : {}),
        ...(typeof rest.status === "string" && rest.status !== "" ? { status: rest.status } : {}),
        ...(byMe ? { assignedToMe: true } : {}),
      });

      const mapped: ApiResponse<BookingListItemDto[]> = {
        isSuccess: body.isSuccess,
        message: body.message ?? "",
        data: body.data,
        metadata: body.metadata ?? undefined,
      };
      return mapped;
    },
  });
}

/**
 {@link useBranchBookingsScrollInfinity}; tên gợi nhớ khi cần “get all” theo từng trang.
 */
export function useBranchBookingsInfiniteScroll(
  branchId: string | undefined,
  options?: BranchBookingsScrollInfinityOptions,
) {
  return useBranchBookingsScrollInfinity(branchId, options);
}

/**
 * Danh sách booking theo chi nhánh (Owner/Manager): `branchId` + phân trang.
 */
export function useBranchBookingsQuery(branchId: string | undefined, options?: BranchBookingsQueryOptions) {
  const pageNumber = options?.pageNumber ?? 1;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const isDescending = options?.isDescending;
  const status = options?.status;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["bookings", "branch", branchId, pageNumber, pageSize, isDescending, status],
    queryFn: async () => {
      const body = await BookingsService.getBookings({
        branchId: branchId!,
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(isDescending != null ? { IsDescending: isDescending } : {}),
        ...(status != null && status !== "" ? { status } : {}),
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

export type UserBookingsQueryOptions = {
  pageNumber?: number;
  pageSize?: number;
  /** Lọc trạng thái — optional */
  status?: string;
  isDescending?: boolean;
  enabled?: boolean;
};

/**
 * Danh sách booking của user đăng nhập — GET /api/v1/bookings (không gửi branchId / assignedToMe).
 */
export function useUserBookingsQuery(options?: UserBookingsQueryOptions) {
  const pageNumber = options?.pageNumber ?? 1;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const status = options?.status;
  const isDescending = options?.isDescending;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["bookings", "user", pageNumber, pageSize, status ?? "", isDescending ?? ""],
    queryFn: async () => {
      const body = await BookingsService.getBookings({
        PageNumber: pageNumber,
        PageSize: pageSize,
        ...(isDescending != null ? { IsDescending: isDescending } : {}),
        ...(status != null && status !== "" ? { status } : {}),
      });
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được danh sách lịch hẹn.");
      }
      return body;
    },
    enabled,
    staleTime: 30_000,
  });
}

const CALENDAR_FETCH_PAGE_SIZE = 100;
const CALENDAR_MAX_PAGES = 50;

/**
 * Tải toàn bộ booking của user (lặp phân trang) cho calendar view — tối đa CALENDAR_MAX_PAGES trang.
 */
export function useUserBookingsCalendarQuery(options?: { status?: string; enabled?: boolean }) {
  const status = options?.status;
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["bookings", "user", "calendar", status ?? ""],
    queryFn: async () => {
      const all: BookingListItemDto[] = [];
      let page = 1;
      while (page <= CALENDAR_MAX_PAGES) {
        const body = await BookingsService.getBookings({
          PageNumber: page,
          PageSize: CALENDAR_FETCH_PAGE_SIZE,
          IsDescending: true,
          ...(status != null && status !== "" ? { status } : {}),
        });
        if (!body.isSuccess) {
          throw new Error(body.message || "Không tải được danh sách lịch hẹn.");
        }
        all.push(...body.data);
        if (!body.metadata?.hasNextPage) break;
        page += 1;
      }
      return all;
    },
    enabled,
    staleTime: 30_000,
  });
}

/**
 * Tải toàn bộ booking theo chi nhánh (lặp phân trang) cho calendar — tối đa CALENDAR_MAX_PAGES trang.
 */
export function useBranchBookingsCalendarQuery(
  branchId: string | undefined,
  options?: { status?: string; enabled?: boolean },
) {
  const status = options?.status;
  const enabled = options?.enabled ?? true;
  const hasBranch = Boolean(branchId);

  return useQuery({
    queryKey: ["bookings", "branch", branchId, "calendar", status ?? ""],
    queryFn: async () => {
      const all: BookingListItemDto[] = [];
      let page = 1;
      while (page <= CALENDAR_MAX_PAGES) {
        const body = await BookingsService.getBookings({
          branchId: branchId!,
          PageNumber: page,
          PageSize: CALENDAR_FETCH_PAGE_SIZE,
          IsDescending: false,
          ...(status != null && status !== "" ? { status } : {}),
        });
        if (!body.isSuccess) {
          throw new Error(body.message || "Không tải được danh sách lịch hẹn.");
        }
        all.push(...body.data);
        if (!body.metadata?.hasNextPage) break;
        page += 1;
      }
      return all;
    },
    enabled: hasBranch && enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
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
        void qc.invalidateQueries({ queryKey: ["bookings", "branch", branchId, "calendar"] });
        void qc.invalidateQueries({ queryKey: ["bookings", "branch", "infinite", branchId] });
      }
      void qc.invalidateQueries({ queryKey: ["bookings", "branch", "infinite", "assigned-to-me"] });
      void qc.invalidateQueries({ queryKey: ["bookings", "user"] });
      void qc.invalidateQueries({ queryKey: ["bookings", "detail", variables.bookingId, "enriched"] });
      toast.success(data.message?.trim() || "Đã gán thợ máy.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gán nhân viên thất bại.");
    },
  });
}

/** PATCH /api/v1/bookings/{id}/status — làm mới danh sách + chi tiết booking. */
export function usePatchBookingStatusMutation(branchId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      ...payload
    }: { bookingId: string } & PatchBookingStatusPayload) => {
      const body = await BookingsService.patchBookingStatus(bookingId, payload);
      if (!body.isSuccess) {
        throw new Error(body.message?.trim() || "Không cập nhật được trạng thái.");
      }
      return body;
    },
    onSuccess: (data, variables) => {
      if (branchId) {
        void qc.invalidateQueries({ queryKey: ["bookings", "branch", branchId] });
        void qc.invalidateQueries({ queryKey: ["bookings", "branch", branchId, "calendar"] });
        void qc.invalidateQueries({ queryKey: ["bookings", "branch", "infinite", branchId] });
      }
      void qc.invalidateQueries({ queryKey: ["bookings", "branch", "infinite", "assigned-to-me"] });
      void qc.invalidateQueries({ queryKey: ["bookings", "user"] });
      void qc.invalidateQueries({ queryKey: ["bookings", "detail", variables.bookingId, "enriched"] });
      toast.success(data.message?.trim() || "Đã cập nhật trạng thái.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Cập nhật trạng thái thất bại.");
    },
  });
}
