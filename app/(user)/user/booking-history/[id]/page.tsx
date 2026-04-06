"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { BookingDetailSuccessLayout } from "@/components/booking/booking-detail-success-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingDetailEnrichedQuery } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

export default function UserBookingDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;

  const q = useBookingDetailEnrichedQuery(id, Boolean(id));

  return (
    <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-screen-2xl flex-1 flex-col gap-4 md:gap-5">
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="lg"
          className="-ml-2 mb-2 h-11 gap-2 px-3 text-base text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/user/booking-history">
            <ArrowLeft className="size-5" aria-hidden />
            Lịch hẹn
          </Link>
        </Button>

      </div>

      <div className={cn("min-h-0 flex-1 overflow-x-hidden")}>
        {!id ? (
          <p className="text-base text-muted-foreground">Thiếu mã lịch hẹn.</p>
        ) : q.isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3 max-w-md rounded-xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : q.isError ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/6 p-5 text-base text-destructive sm:p-6">
            {q.error?.message ?? "Không tải được chi tiết."}
            <Button type="button" variant="outline" size="default" className="mt-4 h-11 text-base" onClick={() => void q.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : q.data ? (
          <>
            <BookingDetailSuccessLayout
              data={q.data}
              variant="detail"
              stepperLayoutId="booking-history-page-progress-pill"
            />
            {q.isFetching && !q.isPending ? (
              <div className="mt-6 flex items-center gap-2 border-t border-border/50 pt-6 text-sm text-muted-foreground md:text-base">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Đang làm mới…
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
