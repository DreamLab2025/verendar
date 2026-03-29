"use client";

import { useCallback } from "react";

import { DeclarePartFlow } from "@/components/common/DeclarePartFlow";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { UserVehiclePart } from "@/lib/api/services/fetchUserVehicle";
import { cn } from "@/lib/utils";

export type DeclarePartDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userVehicleId: string;
  part: UserVehiclePart;
  onDeclared?: () => void;
};

export function DeclarePartDialog({ open, onOpenChange, userVehicleId, part, onDeclared }: DeclarePartDialogProps) {
  const onDismiss = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("flex max-h-[min(92dvh,760px)] max-w-lg flex-col gap-0 overflow-hidden sm:max-w-104")}
      >
        <DeclarePartFlow
          key={part.id}
          userVehicleId={userVehicleId}
          part={part}
          onDismiss={onDismiss}
          onDeclared={onDeclared}
          variant="plain"
        />
      </DialogContent>
    </Dialog>
  );
}
