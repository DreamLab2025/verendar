"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { useBranchBookingsCalendarQuery } from "@/hooks/useBookings";
import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

import { AssignMechanicDialog } from "./assign-mechanic-dialog";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { BranchBookingsCalendar } from "./branch-bookings-calendar";
import { DayBookingsListDialog } from "./day-bookings-list-dialog";

export default function BranchBookingsPage() {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";
  const branchId = typeof params?.branchId === "string" ? params.branchId : "";
  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);
  const [assignBookingId, setAssignBookingId] = useState<string | null>(null);
  const [dayList, setDayList] = useState<{ dateKey: string; bookings: BookingListItemDto[] } | null>(null);

  const q = useBranchBookingsCalendarQuery(branchId || undefined, { enabled: Boolean(branchId) });

  const bookings = q.data ?? [];
  const queryError =
    q.error instanceof Error ? q.error : q.error != null ? new Error(String(q.error)) : null;

  return (
    <div
      className={cn(
        "w-[calc(100%+2rem)] -mx-4 min-w-0 md:w-[calc(100%+3rem)] md:-mx-6",
        branchId
          ? "flex min-h-[calc(100dvh-5rem)] flex-1 flex-col md:min-h-0 md:space-y-8"
          : "space-y-5 md:space-y-8",
      )}
    >
      {!branchId ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Thiếu mã chi nhánh.
        </p>
      ) : (
        <BranchBookingsCalendar
          className="min-h-0 flex-1 md:min-h-auto md:flex-none"
          bookings={bookings}
          isPending={q.isPending}
          isError={q.isError}
          isFetching={q.isFetching}
          error={queryError}
          onRefetch={() => void q.refetch()}
          onOpenDayList={setDayList}
        />
      )}

      {branchId ? (
        <DayBookingsListDialog
          open={dayList != null}
          onOpenChange={(o) => {
            if (!o) setDayList(null);
          }}
          branchId={branchId}
          dateKey={dayList?.dateKey ?? null}
          prefetchedBookings={dayList?.bookings ?? []}
          onOpenDetail={(id) => {
            setDayList(null);
            setDetailBookingId(id);
          }}
          onOpenAssign={(id) => {
            setDayList(null);
            setAssignBookingId(id);
          }}
        />
      ) : null}

      <BookingDetailDialog
        open={Boolean(detailBookingId)}
        onOpenChange={(o) => {
          if (!o) setDetailBookingId(null);
        }}
        bookingId={detailBookingId}
        garageId={garageId}
        branchId={branchId}
        onRequestAssign={() => {
          if (detailBookingId) setAssignBookingId(detailBookingId);
        }}
      />

      {garageId && branchId ? (
        <AssignMechanicDialog
          open={Boolean(assignBookingId)}
          onOpenChange={(o) => {
            if (!o) setAssignBookingId(null);
          }}
          bookingId={assignBookingId}
          garageId={garageId}
          branchId={branchId}
        />
      ) : null}
    </div>
  );
}
