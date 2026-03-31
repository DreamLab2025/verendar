"use client";

import { Building2, Globe, Hash, Mail, Phone, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGarageQuery } from "@/hooks/useGarage";
import { cn } from "@/lib/utils";

interface GarageInfoCardProps {
  garageId: string;
}

export function GarageInfoCard({ garageId }: GarageInfoCardProps) {
  const { data: meRes, isPending, isFetching, isError } = useMyGarageQuery(Boolean(garageId));

  const showSkeleton = isPending || (isFetching && meRes == null);

  if (showSkeleton) {
    return (
      <Card
        className="rounded-2xl border-border/70 shadow-sm"
        aria-busy
        aria-label="Đang tải thông tin garage"
      >
        <CardHeader className="pb-2">
          <Skeleton className="h-7 w-52 max-w-full" />
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 max-w-[min(100%,220px)] flex-1" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 max-w-[min(100%,220px)] flex-1" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 max-w-[min(100%,220px)] flex-1" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-44 max-w-full" />
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 max-w-[min(100%,220px)] flex-1" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 max-w-[min(100%,220px)] flex-1" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-4 max-w-[min(100%,220px)] flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const garage =
    meRes?.isSuccess && meRes.data && meRes.data.id === garageId ? meRes.data : null;

  if (isError || !garage) {
    return (
      <Card className="border-border/70">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {isError
            ? "Không tải được thông tin chi tiết garage."
            : "Garage không khớp với tài khoản của bạn."}
        </CardContent>
      </Card>
    );
  }

  const owner = garage.ownerDisplayName?.trim() ?? "";
  const email = garage.contactEmail?.trim() ?? "";
  const phone = garage.contactPhone?.trim() ?? "";
  const taxCode = garage.taxCode?.trim() ?? "";
  const branchCount = String(garage.branchCount);

  const ownerPh = !owner;
  const emailPh = !email;
  const phonePh = !phone;
  const taxPh = !taxCode;

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">Thông tin cơ bản</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Chủ sở hữu</p>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
            <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                ownerPh ? "text-muted-foreground/70" : "text-foreground",
              )}
            >
              {ownerPh ? "—" : owner}
            </span>
          </div>
        </div>

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Email</p>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
            <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                emailPh ? "text-muted-foreground/70" : "text-foreground",
              )}
            >
              {emailPh ? "—" : email}
            </span>
          </div>
        </div>

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Số điện thoại</p>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
            <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                phonePh ? "text-muted-foreground/70" : "text-foreground",
              )}
            >
              {phonePh ? "—" : phone}
            </span>
          </div>
        </div>

        <div className="grid gap-1.5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Website</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">Đường dẫn công khai cho garage</p>
          </div>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
            <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{"\u00A0"}</span>
          </div>
        </div>

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Mã số thuế</p>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
            <Hash className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                taxPh ? "text-muted-foreground/70" : "text-foreground",
              )}
            >
              {taxPh ? "—" : taxCode}
            </span>
          </div>
        </div>

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Số lượng chi nhánh</p>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 dark:bg-muted/20">
            <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{branchCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
