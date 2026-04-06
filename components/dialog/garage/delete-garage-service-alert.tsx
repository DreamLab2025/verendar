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
import { useDeleteGarageService } from "@/hooks/useGarage";

export type DeleteGarageServiceAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  target: { id: string; name: string } | null;
};

export function DeleteGarageServiceAlert({ open, onOpenChange, branchId, target }: DeleteGarageServiceAlertProps) {
  const deleteMut = useDeleteGarageService();

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
          <AlertDialogTitle>Xóa dịch vụ?</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {target ? (
              <>
                {" "}
                Dịch vụ <span className="font-medium text-foreground">«{target.name}»</span> sẽ không còn hiển thị trong
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
