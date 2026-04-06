/**
 * Booking API — POST /api/v1/bookings (MVP, chưa thanh toán)
 */

import api8080Service from "../api8080Service";

import type { BookingCartLine } from "@/lib/stores/booking-cart-store";

export interface CreateBookingItemRequest {
  productId: string | null;
  serviceId: string | null;
  bundleId: string | null;
  includeInstallation: boolean;
  sortOrder: number;
}

export interface CreateBookingRequest {
  garageBranchId: string;
  userVehicleId: string;
  scheduledAt: string;
  note: string;
  items: CreateBookingItemRequest[];
}

export interface BookingBundleDetailItemDto {
  productId: string | null;
  serviceId: string | null;
  itemName: string;
  includeInstallation: boolean;
}

export interface BookingBundleDetailsDto {
  id: string;
  name: string;
  discountAmount: number | null;
  discountPercent: number | null;
  items: BookingBundleDetailItemDto[];
}

export interface BookingLineItemDto {
  id: string;
  productId: string | null;
  serviceId: string | null;
  bundleId: string | null;
  includeInstallation: boolean;
  itemName: string;
  bookedItemAmount: number;
  bookedItemCurrency: string;
  sortOrder: number;
  bundleDetails?: BookingBundleDetailsDto | null;
}

export interface BookingBranchSummaryDto {
  id: string;
  name: string;
  addressLine: string;
  garageId: string;
  garageBusinessName: string;
}

export interface BookingCustomerDto {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface BookingVehicleDto {
  userVehicleId: string;
  licensePlate: string;
  vin: string;
  currentOdometer: number;
  modelName: string;
  brandName: string;
  variantColor: string;
  imageUrl: string;
}

export interface BookingStatusHistoryDto {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedByUserId: string | null;
  note: string | null;
  changedAt: string;
  createdAt: string;
}

export interface BookingDetailDto {
  id: string;
  userId: string;
  userVehicleId: string;
  garageBranchId: string;
  mechanicId: string | null;
  mechanicDisplayName: string | null;
  status: string;
  scheduledAt: string;
  note: string | null;
  bookedTotalAmount: number;
  bookedCurrency: string;
  completedAt: string | null;
  currentOdometer: number | null;
  cancellationReason: string | null;
  paymentId: string | null;
  branch: BookingBranchSummaryDto;
  lineItems: BookingLineItemDto[];
  statusHistory: BookingStatusHistoryDto[];
  /** API tạo đơn đôi khi trả null — UI có thể merge từ client (JWT + xe đã chọn). */
  customer: BookingCustomerDto | null;
  vehicle: BookingVehicleDto | null;
}

export interface CreateBookingResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BookingDetailDto | null;
  metadata: unknown;
}

/** Mỗi dòng giỏ → một phần tử `items` với đúng một trong productId / serviceId / bundleId. */
export function mapCartLinesToBookingItems(lines: BookingCartLine[]): CreateBookingItemRequest[] {
  return lines.map((line, index) => {
    const base: CreateBookingItemRequest = {
      productId: null,
      serviceId: null,
      bundleId: null,
      includeInstallation: false,
      sortOrder: index,
    };
    if (line.kind === "product") {
      return {
        ...base,
        productId: line.catalogItemId,
        includeInstallation: Boolean(line.includeInstallation),
      };
    }
    if (line.kind === "service") {
      return { ...base, serviceId: line.catalogItemId };
    }
    return { ...base, bundleId: line.catalogItemId };
  });
}

export const BookingService = {
  createBooking: async (payload: CreateBookingRequest) => {
    const res = await api8080Service.post<CreateBookingResponse>("/api/v1/bookings", payload);
    return res.data;
  },
};

export default BookingService;
