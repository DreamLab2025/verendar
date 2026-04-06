import type { BookingLineItemDto } from "@/lib/api/services/fetchBooking";

import { formatBookingRequireMoney } from "./format";

/** Nhãn loại dòng: Phụ tùng / Dịch vụ / Combo (lắp đặt hiển thị riêng qua `includeInstallation`). */
export function bookingLineKindLabel(line: BookingLineItemDto): string {
  if (line.bundleId) return "Combo";
  if (line.productId) return "Phụ tùng";
  if (line.serviceId) return "Dịch vụ";
  return "Mục";
}

/** Ảnh catalog từ chi tiết nhúng (phụ tùng / dịch vụ). */
export function bookingLineThumbnailUrl(line: BookingLineItemDto): string | undefined {
  const u = line.productDetails?.imageUrl?.trim() || line.serviceDetails?.imageUrl?.trim();
  return u || undefined;
}

/** Mô tả ngắn từ chi tiết nhúng. */
export function bookingLineDescription(line: BookingLineItemDto): string | undefined {
  const d = line.productDetails?.description?.trim() || line.serviceDetails?.description?.trim();
  return d || undefined;
}

/** Thời lượng ước tính (phút) từ chi tiết nhúng. */
export function bookingLineEstimatedMinutes(line: BookingLineItemDto): number | undefined {
  const n = line.productDetails?.estimatedDurationMinutes ?? line.serviceDetails?.estimatedDurationMinutes;
  return typeof n === "number" && !Number.isNaN(n) ? n : undefined;
}

/** Giá tham chiếu từ catalog (vật tư / nhân công) — khác với giá đã book. */
export function bookingLineReferencePrice(line: BookingLineItemDto): { label: string; formatted: string } | null {
  const mp = line.productDetails?.materialPrice;
  if (line.productDetails && mp != null) {
    const cur = line.productDetails.materialPriceCurrency ?? "VND";
    return { label: "Giá vật tư (tham chiếu)", formatted: formatBookingRequireMoney(mp, cur) };
  }
  const lp = line.serviceDetails?.laborPrice;
  if (line.serviceDetails && lp != null) {
    const cur = line.serviceDetails.laborPriceCurrency ?? "VND";
    return { label: "Giá nhân công (tham chiếu)", formatted: formatBookingRequireMoney(lp, cur) };
  }
  return null;
}
