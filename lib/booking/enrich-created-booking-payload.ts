import { getCookie } from "cookies-next";

import type { CreateBookingResponse } from "@/lib/api/services/fetchBooking";
import type { BookingCustomerDto, BookingVehicleDto } from "@/lib/api/services/fetchBooking";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";

function decodeJwtPayload(raw: string): Record<string, unknown> | null {
  try {
    const part = raw.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Khách hàng từ JWT (cookie) khi POST booking không embed customer. */
export function getCustomerSnapshotFromAuthCookie(): BookingCustomerDto | null {
  if (typeof window === "undefined") return null;
  const token =
    (getCookie("authToken") as string | undefined) ?? (getCookie("auth-token") as string | undefined);
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const userName = typeof payload.userName === "string" ? payload.userName.trim() : "";
  const uniqueName = typeof payload.unique_name === "string" ? payload.unique_name.trim() : "";
  const phone =
    typeof payload.phone_number === "string"
      ? payload.phone_number.trim()
      : typeof payload.phoneNumber === "string"
        ? payload.phoneNumber.trim()
        : "";

  const fullName = userName || uniqueName || email.split("@")[0] || "—";

  return {
    fullName,
    email,
    phoneNumber: phone,
  };
}

function mapUserVehicleToDto(v: UserVehicle): BookingVehicleDto {
  const m = v.variant.model;
  return {
    userVehicleId: v.id,
    licensePlate: v.licensePlate,
    vin: v.vinNumber || "",
    currentOdometer: v.currentOdometer,
    brandName: m.brandName,
    modelName: m.name,
    variantColor: v.variant.color,
  };
}

/**
 * Gộp khách + xe hiển thị khi API `POST /bookings` trả `customer`/`vehicle` null
 * nhưng đã có `userVehicleId` và người dùng đã chọn xe trên UI.
 */
export function enrichCreatedBookingPayload(
  res: CreateBookingResponse,
  ctx: { vehicle: UserVehicle | null },
): CreateBookingResponse {
  if (!res.data) return res;
  const data = { ...res.data };

  if (data.customer == null) {
    const c = getCustomerSnapshotFromAuthCookie();
    if (c) data.customer = c;
  }

  if (data.vehicle == null && ctx.vehicle && data.userVehicleId === ctx.vehicle.id) {
    data.vehicle = mapUserVehicleToDto(ctx.vehicle);
  }

  return { ...res, data };
}
