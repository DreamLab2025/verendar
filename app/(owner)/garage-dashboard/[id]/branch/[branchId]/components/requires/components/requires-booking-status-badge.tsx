import { bookingStatusLabelVi } from "@/components/helper/booking-require";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RequiresBookingStatusBadgeProps = {
  status: string;
  className?: string;
};

export function RequiresBookingStatusBadge({ status, className }: RequiresBookingStatusBadgeProps) {
  const label = bookingStatusLabelVi(status);

  if (status === "Pending") {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
          "border-amber-500/40 bg-amber-500/12 text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-50",
          className,
        )}
      >
        {label}
      </span>
    );
  }

  if (status === "Cancelled") {
    return (
      <Badge variant="destructive" className={cn("max-w-full truncate font-normal", className)}>
        {label}
      </Badge>
    );
  }

  const variant =
    status === "Completed" || status === "Confirmed" ? "default" : status === "InProgress" ? "secondary" : "outline";

  return (
    <Badge variant={variant} className={cn("max-w-full truncate font-normal", className)}>
      {label}
    </Badge>
  );
}
