"use client";

import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteGarageBundle } from "@/hooks/useGarage";

export type DeleteGarageBundleAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  target: { id: string; name: string } | null;
};

export function DeleteGarageBundleAlert({ open, onOpenChange, branchId, target }: DeleteGarageBundleAlertProps) {
  const deleteMut = useDeleteGarageBundle();

  const handleDelete = () => {
    if (!target) return;
    deleteMut.mutate(
      { id: target.id, branchId },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa combo?</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Gọi <span className="font-mono text-xs">DELETE /api/v1/garage-bundles/{"{id}"}</span> — xóa mềm.
            {target ? (
              <>
                {" "}
                Combo <span className="font-medium text-foreground">«{target.name}»</span> sẽ không còn hiển thị trong
                danh sách.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={deleteMut.isPending} className="mt-0 sm:mt-0">
            Hủy
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMut.isPending}
            className="gap-2"
            onClick={handleDelete}
          >
            {deleteMut.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
