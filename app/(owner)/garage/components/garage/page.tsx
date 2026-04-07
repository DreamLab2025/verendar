"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGarageQuery } from "@/hooks/useGarage";
import { isApiNotFoundError } from "@/lib/api/is-api-not-found";
import { isGarageOwnerDashboardBlocked } from "@/lib/api/services/fetchGarage";

import { GarageOwnerMyGarageCard } from "./components/garage-owner-my-garage-card";

export default function GarageOwnerGarageSectionPage() {
  const { data: res, isPending, isError, error } = useMyGarageQuery();

  if (isPending) {
    return (
      <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <Skeleton className="h-40 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError && isApiNotFoundError(error)) {
    return (
      <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Garage của tôi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Bạn chưa đăng ký garage.
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error instanceof Error ? error.message : "Không tải được thông tin garage."}</AlertDescription>
      </Alert>
    );
  }

  if (!res?.isSuccess || !res.data) {
    return (
      <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Garage của tôi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {res?.message ?? "Chưa có dữ liệu garage."}
        </CardContent>
      </Card>
    );
  }

  const dashboardHref = isGarageOwnerDashboardBlocked(res.data.status)
    ? null
    : `/garage-dashboard/${res.data.id}`;

  return <GarageOwnerMyGarageCard garage={res.data} dashboardHref={dashboardHref} />;
}
