"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGarageQuery } from "@/hooks/useGarage";

import { GarageOwnerBranchCard } from "./components/garage-owner-branch-card";

export default function GarageOwnerBranchesSectionPage() {
  const { data: res, isPending, isError, error } = useMyGarageQuery();

  if (isPending) {
    return (
      <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
        <CardHeader>
          <Skeleton className="h-7 w-56" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error instanceof Error ? error.message : "Không tải được danh sách chi nhánh."}</AlertDescription>
      </Alert>
    );
  }

  const garage = res?.isSuccess && res.data ? res.data : null;
  const branches = garage?.branches ?? [];

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Các chi nhánh của tôi</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {branches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có chi nhánh nào.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {branches.map((branch) => (
              <div key={branch.id} className="min-w-0">
                <GarageOwnerBranchCard branch={branch} garageId={garage?.id} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
