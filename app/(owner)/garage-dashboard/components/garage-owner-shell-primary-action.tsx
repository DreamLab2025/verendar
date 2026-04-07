"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { GarageDialog } from "@/components/dialog/garage/GarageDialog";
import { Button } from "@/components/ui/button";
import { useMyGarageQuery, useResubmitGarage } from "@/hooks/useGarage";
import { isGarageStatusActive, isGarageStatusRejected } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof Button>;

/**
 * Sidebar / mobile: chưa có garage → tạo; Active → vào dashboard; Rejected → gửi lại hồ sơ;
 * các trạng thái khác (chờ duyệt, …) → không hiện nút.
 */
export function GarageOwnerShellPrimaryAction({ className, ...buttonProps }: ButtonProps) {
  const { data: res, isPending } = useMyGarageQuery();
  const resubmit = useResubmitGarage();
  const garage = res?.isSuccess && res.data ? res.data : null;

  if (isPending) return null;

  if (!garage) {
    return (
      <GarageDialog>
        <Button type="button" className={cn("shadow-sm", className)} {...buttonProps}>
          Tạo garage
        </Button>
      </GarageDialog>
    );
  }

  if (isGarageStatusActive(garage.status)) {
    return (
      <Button asChild className={cn("shadow-sm", className)} {...buttonProps}>
        <Link href={`/garage-dashboard/${garage.id}`}>Vào dashboard</Link>
      </Button>
    );
  }

  if (isGarageStatusRejected(garage.status)) {
    return (
      <Button
        type="button"
        className={cn("shadow-sm", className)}
        {...buttonProps}
        disabled={resubmit.isPending}
        onClick={() => resubmit.mutate(garage.id)}
      >
        {resubmit.isPending ? (
          <Loader2 className="mr-2 size-4 shrink-0 animate-spin" aria-hidden />
        ) : null}
        Gửi lại hồ sơ
      </Button>
    );
  }

  return null;
}
