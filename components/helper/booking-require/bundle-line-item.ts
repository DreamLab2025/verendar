import type { BookingBundleDetailItemDto } from "@/lib/api/services/fetchBooking";

export function formatBundleDetailItemLabel(bi: BookingBundleDetailItemDto): string {
  const name =
    bi.itemName?.trim() ||
    (bi.productId ? "Phụ tùng" : bi.serviceId ? "Dịch vụ" : "Mục trong combo");
  return bi.includeInstallation ? `${name} (+ lắp)` : name;
}
