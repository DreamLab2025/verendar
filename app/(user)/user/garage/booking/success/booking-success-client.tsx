"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BookingDetailSuccessLayout } from "@/components/booking/booking-detail-success-layout";
import { Button } from "@/components/ui/button";
import type { BookingDetailDto } from "@/lib/api/services/fetchBooking";
import { readCreatedBookingResponse } from "@/lib/booking/booking-success-storage";
import { minimalEnrichedFromBookingDetailDto } from "@/lib/booking/enrich-booking-detail";

function BookingSuccessShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 w-full min-w-0 max-w-[100vw] overflow-x-hidden bg-linear-to-b from-muted/45 to-background pb-[max(3rem,env(safe-area-inset-bottom))] pt-3 dark:from-muted/20 sm:pb-16 sm:pt-6">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function BookingSuccessClient() {
  const [hydrated, setHydrated] = useState(false);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  /* eslint-disable react-hooks/set-state-in-effect -- cờ post-mount để đồng bộ SSR/hydration với searchParams + sessionStorage */
  useEffect(() => {
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const payload = useMemo(() => {
    if (!bookingId) return null;
    return readCreatedBookingResponse(bookingId);
  }, [bookingId]);

  const data: BookingDetailDto | null | undefined = payload?.data ?? undefined;

  /** Tránh hydration mismatch: `useSearchParams` / sessionStorage khác SSR vs client. */
  if (!hydrated) {
    return (
      <BookingSuccessShell>
        <p className="py-16 text-center text-sm text-muted-foreground">Đang tải…</p>
      </BookingSuccessShell>
    );
  }

  if (!bookingId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Thiếu mã đặt lịch.</p>
        <Button asChild className="mt-6 h-11 w-full max-w-xs rounded-xl" variant="default">
          <Link href="/user/garage">Về garage</Link>
        </Button>
      </div>
    );
  }

  if (!payload || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Không tải được chi tiết (tab mới hoặc dữ liệu phiên đã hết hạn). Mã tham chiếu:
        </p>
        <Button asChild className="mt-8 h-11 w-full max-w-xs rounded-xl" variant="default">
          <Link href="/user/garage">Về garage</Link>
        </Button>
      </div>
    );
  }

  const enriched = minimalEnrichedFromBookingDetailDto(data);

  const successFootnote = payload.message?.trim()
    ? payload.message.trim()
    : payload.isSuccess
      ? "Đặt lịch thành công."
      : null;

  return (
    <BookingSuccessShell>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-1 mb-3 h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground sm:-ml-2 sm:mb-5 sm:h-9 sm:text-sm"
        asChild
      >
        <Link href="/user/garage">
          <ArrowLeft className="size-3.5 sm:size-4" aria-hidden />
          Garage
        </Link>
      </Button>

      <BookingDetailSuccessLayout
        data={enriched}
        variant="success"
        stepperLayoutId="booking-success-progress-pill"
        headerExtra={
          successFootnote ? (
            <p className="mt-2 text-[11px] font-medium text-emerald-800/90 dark:text-emerald-200/90 sm:mt-2.5 sm:text-xs">
              {successFootnote}
            </p>
          ) : undefined
        }
        asideFooter={
          <div className="mt-6 hidden lg:block">
            <Button asChild className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm" size="lg">
              <Link href="/user/garage">Về trang garage</Link>
            </Button>
          </div>
        }
        articleBottom={
          <div className="border-t border-border/60 bg-muted/25 px-4 py-3 dark:bg-muted/15 sm:px-6 sm:py-4 lg:hidden">
            <Button
              asChild
              className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm sm:h-12 sm:text-base"
              size="lg"
            >
              <Link href="/user/garage">Về trang garage</Link>
            </Button>
          </div>
        }
      />
    </BookingSuccessShell>
  );
}
