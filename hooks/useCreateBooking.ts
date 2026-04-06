import BookingService, { CreateBookingRequest, CreateBookingResponse } from "@/lib/api/services/fetchBooking";
import { useMutation } from "@tanstack/react-query";

export function useCreateBooking() {
  return useMutation({
    mutationKey: ["bookings", "create"],
    mutationFn: (payload: CreateBookingRequest) => BookingService.createBooking(payload),
  });
}

export type { CreateBookingRequest, CreateBookingResponse };
