"use client";

import { AlertCircle, Building2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGarageBranchQuery } from "@/hooks/useGarage";
import { garageBranchMeToGarageBranchDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

import { GarageOwnerBranchCard } from "./garage-owner-branch-card";

function StaffBranchSectionHeader() {
  return (
    <div
      className={cn(
        "relative border-b border-border/60",
        "bg-linear-to-br from-primary/[0.07] via-background to-muted/30",
        "px-4 py-5 sm:px-6 sm:py-6",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:shadow-none">
          <Building2 className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1.5 pt-0.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Chi nhánh của tôi</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Thông tin chi nhánh bạn đang làm việc — một chi nhánh, xem nhanh trên một hàng.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StaffMyBranch() {
  const { data: res, isPending, isError, error } = useMyGarageBranchQuery();

  if (isPending) {
    return (
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm ring-1 ring-border/30">
        <div className="border-b border-border/60 bg-muted/25 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-4">
            <Skeleton className="size-12 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-6 w-48 max-w-full sm:h-7" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-2/3 max-w-sm" />
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5">
          <div className="relative flex gap-3 overflow-hidden rounded-xl border border-border/50 bg-card/50 sm:gap-4">
            <Skeleton className="absolute right-2 top-2 z-10 h-6 w-24 rounded-full sm:right-3 sm:top-3" />
            <Skeleton className="h-38 w-[min(40%,10.5rem)] shrink-0 rounded-none sm:h-44 sm:w-44" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-2 pr-2 sm:py-3 sm:pr-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="overflow-hidden rounded-2xl border-destructive/25 bg-card shadow-sm ring-1 ring-destructive/20">
        <div className="border-b border-destructive/20 bg-destructive/6 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-destructive/15 text-destructive">
              <AlertCircle className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1 pt-0.5">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Chi nhánh của tôi</h2>
              <p className="text-sm text-destructive/90">Không thể tải thông tin chi nhánh.</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5">
          <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
            <AlertDescription className="text-destructive/90">
              {error instanceof Error ? error.message : "Không tải được thông tin chi nhánh."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!res?.isSuccess || !res.data) {
    return (
      <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm ring-1 ring-border/30">
        <StaffBranchSectionHeader />
        <CardContent className="p-6 sm:p-8">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted/80 text-muted-foreground">
              <Building2 className="size-7" aria-hidden />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{res?.message ?? "Chưa có dữ liệu chi nhánh."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const branchMe = res.data;
  const branch = garageBranchMeToGarageBranchDto(branchMe);

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm ring-1 ring-border/30">
      <StaffBranchSectionHeader />
      <CardContent className="bg-muted/15 p-3 sm:p-4 md:p-5">
        <ul className="list-none space-y-0">
          <li>
            <GarageOwnerBranchCard branch={branch} garageId={branchMe.garageId} variant="row" />
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
