import type { CreateBookingResponse } from "@/lib/api/services/fetchBooking";

const key = (bookingId: string) => `verendar-booking-success:${bookingId}`;

export function persistCreatedBookingResponse(bookingId: string, body: CreateBookingResponse) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key(bookingId), JSON.stringify(body));
  } catch {
    // ignore quota / private mode
  }
}

export function readCreatedBookingResponse(bookingId: string): CreateBookingResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(key(bookingId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CreateBookingResponse;
  } catch {
    return null;
  }
}
