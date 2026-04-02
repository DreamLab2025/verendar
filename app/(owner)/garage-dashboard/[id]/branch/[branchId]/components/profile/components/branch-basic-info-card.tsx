"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Building2, Globe, Hash, Mail, Phone, Star, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyGarageQuery } from "@/hooks/useGarage";
import type { GarageBranchMeDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

function BranchProfileInfoField({
  label,
  icon: Icon,
  iconClassName,
  children,
}: {
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex min-h-12 items-center gap-3 rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-base text-foreground dark:bg-muted/15">
        <Icon className={cn("size-5 shrink-0 text-muted-foreground", iconClassName)} aria-hidden />
        <span className="min-w-0 flex-1 truncate tabular-nums">{children}</span>
      </div>
    </div>
  );
}

type BranchBasicInfoCardProps = {
  garageId: string;
  branchMe: GarageBranchMeDto;
  phoneDisplay: string;
  taxDisplay: string;
  ratingDisplay: string | null;
};

export function BranchBasicInfoCard({
  garageId,
  branchMe,
  phoneDisplay,
  taxDisplay,
  ratingDisplay,
}: BranchBasicInfoCardProps) {
  const { data: meRes } = useMyGarageQuery(Boolean(garageId));
  const garage =
    meRes?.isSuccess && meRes.data && meRes.data.id === garageId ? meRes.data : null;

  const owner = garage?.ownerDisplayName?.trim() || "—";
  const email = garage?.contactEmail?.trim() || "—";
  const branchCount = garage != null ? String(garage.branchCount) : "—";
  const websiteUrl = branchMe.mapLinks?.googleMaps?.trim() || branchMe.mapLinks?.openStreetMap?.trim();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3 pt-6 sm:pt-7">
        <CardTitle className="text-xl font-semibold tracking-tight">Thông tin cơ bản</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
        <BranchProfileInfoField label="Chủ sở hữu" icon={User}>
          {owner}
        </BranchProfileInfoField>
        <BranchProfileInfoField label="Email" icon={Mail}>
          {email}
        </BranchProfileInfoField>
        <BranchProfileInfoField label="Số điện thoại" icon={Phone}>
          {phoneDisplay}
        </BranchProfileInfoField>
        <div className="space-y-2 sm:col-span-1">
          <p className="text-sm font-medium text-muted-foreground">Website</p>
          <div className="flex min-h-12 items-center gap-3 rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-base dark:bg-muted/15">
            <Globe className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            {websiteUrl ? (
              <Link
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-primary underline-offset-4 hover:underline"
              >
                {websiteUrl}
              </Link>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </div>
        <BranchProfileInfoField label="Mã số thuế" icon={Hash}>
          {taxDisplay}
        </BranchProfileInfoField>
        <BranchProfileInfoField label="Số lượng chi nhánh" icon={Building2}>
          {branchCount}
        </BranchProfileInfoField>
        {ratingDisplay ? (
          <div className="sm:col-span-2">
            <BranchProfileInfoField
              label="Đánh giá"
              icon={Star}
              iconClassName="fill-amber-400 text-amber-500"
            >
              {ratingDisplay}
            </BranchProfileInfoField>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
