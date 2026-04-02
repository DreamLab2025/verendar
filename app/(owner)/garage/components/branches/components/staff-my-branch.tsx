"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGarageBranchQuery } from "@/hooks/useGarage";
import { garageBranchMeToGarageBranchDto } from "@/lib/api/services/fetchGarage";

import { GarageOwnerBranchCard } from "./garage-owner-branch-card";

export default function StaffMyBranch() {
  const { data: res, isPending, isError, error } = useMyGarageBranchQuery();

  if (isPending) {
    return (
      <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
        <CardHeader>
          <Skeleton className="h-7 w-56" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : "Không tải được thông tin chi nhánh."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!res?.isSuccess || !res.data) {
    return (
      <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Chi nhánh của tôi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground pt-0">
          {res?.message ?? "Chưa có dữ liệu chi nhánh."}
        </CardContent>
      </Card>
    );
  }

  const branchMe = res.data;
  const branch = garageBranchMeToGarageBranchDto(branchMe);

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Chi nhánh của tôi</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-w-xl">
          <GarageOwnerBranchCard branch={branch} garageId={branchMe.garageId} />
        </div>
      </CardContent>
    </Card>
  );
}
