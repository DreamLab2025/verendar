"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMemberPasswordQuery } from "@/hooks/useBranchMember";

export type StaffMemberPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garageId: string;
  memberId: string | null;
  memberName: string | null;
};

export function StaffMemberPasswordDialog({
  open,
  onOpenChange,
  garageId,
  memberId,
  memberName,
}: StaffMemberPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const { data, isPending, isError, error, refetch } = useMemberPasswordQuery(
    garageId || undefined,
    memberId || undefined,
    open && Boolean(garageId && memberId),
  );

  const password = data?.data?.staffPassword ?? null;
  const displayName = memberName?.trim() || "Nhân viên";

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mật khẩu nhân viên</DialogTitle>
          <DialogDescription>
            Mật khẩu đăng nhập dành cho tài khoản nhân viên tại garage — {displayName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              Đang tải…
            </div>
          ) : isError ? (
            <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="text-destructive">{error?.message ?? "Không tải được mật khẩu."}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : password == null || password === "" ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
              Chưa có mật khẩu (hoặc chưa được thiết lập).
            </p>
          ) : (
            <div className="flex gap-2">
              <Input
                readOnly
                type={showPassword ? "text" : "password"}
                value={password}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
