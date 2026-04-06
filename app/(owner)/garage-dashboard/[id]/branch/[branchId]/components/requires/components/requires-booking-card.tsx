import { CarFront, MapPin } from "lucide-react";

import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

import {
  formatBookingRequireDdMmYyyy,
  formatBookingRequireTimeOnly,
  formatBookingRequireVnd,
} from "@/components/helper/booking-require";

import { RequiresBookingStatusBadge } from "./requires-booking-status-badge";

type RequiresBookingCardProps = {
  booking: BookingListItemDto;
  className?: string;
  /** Mở dialog chi tiết yêu cầu */
  onOpenDetail?: () => void;
};

export function RequiresBookingCard({ booking, className, onOpenDetail }: RequiresBookingCardProps) {
  const branch = booking.branchName?.trim() || "—";
  const title = booking.itemsSummary?.trim() || "Lịch hẹn";
  const dateFooter = formatBookingRequireDdMmYyyy(booking.scheduledAt);
  const timeFooter = formatBookingRequireTimeOnly(booking.scheduledAt);

  return (
    <article
      role={onOpenDetail ? "button" : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      onClick={onOpenDetail ? () => onOpenDetail() : undefined}
      onKeyDown={
        onOpenDetail
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenDetail();
              }
            }
          : undefined
      }
      className={cn(
        "flex h-full flex-col rounded-xl border border-border/80 bg-card p-4 text-card-foreground shadow-sm transition-shadow",
        onOpenDetail && "cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !onOpenDetail && "hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/25"
            aria-hidden
          >
            <CarFront className="size-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </h3>
          </div>
        </div>

        <div className="shrink-0 self-start pt-0.5">
          <RequiresBookingStatusBadge status={booking.status} />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-sm text-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 leading-snug">{branch}</span>
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-border/50 pt-3">
        <p className="text-sm font-semibold tabular-nums text-foreground">{formatBookingRequireVnd(booking.bookedTotalAmount)}</p>
        <p className="text-xs text-muted-foreground">
          Ngày hẹn: {dateFooter}
          {timeFooter !== "—" ? ` · ${timeFooter}` : ""}
        </p>
      </div>
    </article>
  );
}
