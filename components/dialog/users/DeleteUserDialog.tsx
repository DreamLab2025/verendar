"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string;
}

export function DeleteUserDialog({ open, onOpenChange, userId, userName }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    if (!userId) return;
    
    try {
      await deleteUser.mutateAsync(userId);
      toast.success("Xóa người dùng thành công");
      onOpenChange(false);
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Không thể xóa người dùng");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-[400px]">
        <AlertDialogHeader className="items-center text-center space-y-3">
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="size-6" />
          </div>
          <AlertDialogTitle className="text-xl font-bold">Xác nhận xóa?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Bạn có chắc chắn muốn xóa người dùng <span className="font-bold text-foreground">&quot;{userName || userId}&quot;</span>? 
            Hành động này <span className="text-destructive font-semibold">không thể</span> hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
          <AlertDialogCancel className="rounded-xl flex-1 border-border/60">Hủy</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="rounded-xl flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm shadow-destructive/20"
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Xóa vĩnh viễn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
