"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchProfileBranch } from "@/hooks/useGarage";
import {
  garageBranchMeToGarageBranchDto,
  getGarageBranchStatusLabelVi,
} from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

import { BranchBasicInfoCard } from "./branch-basic-info-card";
import { BranchDescriptionCard } from "./branch-description-card";
import { BranchMapCard } from "./branch-map-card";
import { BranchWorkingHoursCard } from "./branch-working-hours-card";

const branchProfileContentInsetClass = "w-full min-w-0 px-10";

type BranchProfileCardProps = {
  garageId: string;
  branchId: string;
};

function isPendingBranch(status: string): boolean {
  return status === "Pending";
}

function BranchProfileCardsSkeleton() {
  const sectionBlock = (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={cn(
        branchProfileContentInsetClass,
        "grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6",
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <Skeleton className="h-7 w-56" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
        {sectionBlock}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 p-4 sm:p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
      <div className="min-w-0">{sectionBlock}</div>
    </div>
  );
}

export function BranchProfileCard({ garageId, branchId }: BranchProfileCardProps) {
  const { isGarageOwner, isPending, isError, res, branchMe } = useBranchProfileBranch(garageId, branchId);

  if (isPending) {
    return <BranchProfileCardsSkeleton />;
  }

  let errorMessage: string | null = null;
  if (isError || !res?.isSuccess || !res.data) {
    errorMessage = isError
      ? "Không tải được thông tin chi nhánh."
      : (res?.message ?? "Chưa có dữ liệu chi nhánh.");
  } else if (!branchMe) {
    errorMessage = isGarageOwner
      ? "Không tải được thông tin chi nhánh."
      : "Không hiển thị thẻ chi tiết — dữ liệu không khớp URL.";
  }

  if (errorMessage) {
    return (
      <div className={cn(branchProfileContentInsetClass, "flex min-h-[80dvh] flex-col items-center justify-center")}>
        <Card className="w-full border-2 border-destructive bg-destructive/5 shadow-sm dark:bg-destructive/10">
          <CardContent className="flex min-h-60 items-center justify-center px-6 py-12 text-center text-sm font-medium text-destructive sm:px-10 sm:text-base">
            {errorMessage}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!branchMe) {
    return null;
  }

  const branch = garageBranchMeToGarageBranchDto(branchMe);
  const pending = isPendingBranch(branch.status);
  const statusLabel = pending ? "Đang chờ duyệt" : getGarageBranchStatusLabelVi(branch.status);
  const desc = branchMe.description?.trim() ?? "";
  const tax = branchMe.taxCode?.trim() || "—";
  const phone = branch.phoneNumber?.trim() || "—";
  const rating =
    branchMe.averageRating != null && branchMe.averageRating > 0
      ? `${branchMe.averageRating.toFixed(1)}${branchMe.reviewCount > 0 ? ` · ${branchMe.reviewCount} đánh giá` : ""}`
      : null;

  return (
    <div
      className={cn(
        branchProfileContentInsetClass,
        "grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6",
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <BranchBasicInfoCard
          garageId={garageId}
          branchMe={branchMe}
          phoneDisplay={phone}
          taxDisplay={tax}
          ratingDisplay={rating}
        />
        <BranchDescriptionCard description={desc} />
        <BranchWorkingHoursCard workingHours={branchMe.workingHours} />
      </div>
      <div className="min-w-0 sticky top-5 z-10">
      <BranchMapCard branch={branch} branchMe={branchMe} statusLabel={statusLabel} pending={pending} />

      </div>
    </div>
  );
}
