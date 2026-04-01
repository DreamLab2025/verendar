import { Suspense } from "react";

import { BookingSuccessClient } from "./booking-success-client";

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-2xl px-4 py-10 text-center text-sm text-muted-foreground">Đang tải…</div>}
    >
      <BookingSuccessClient />
    </Suspense>
  );
}
