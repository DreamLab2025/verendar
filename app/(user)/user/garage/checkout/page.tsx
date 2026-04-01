import { Suspense } from "react";

import { GarageCheckoutContent } from "./checkout-content";

export default function UserGarageCheckoutPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/30 dark:bg-muted/15">
      <Suspense
        fallback={
          <div className="flex min-h-[30vh] flex-1 items-center justify-center text-sm text-muted-foreground">
            Đang tải…
          </div>
        }
      >
        <GarageCheckoutContent />
      </Suspense>
    </div>
  );
}
