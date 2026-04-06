"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ChangePasswordDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: (newPassword: string) => void;
  isLoading?: boolean;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  onSuccess,
  isLoading,
}: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewPassword("");
      setConfirmPassword("");
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      onSuccess(newPassword);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 grid w-full sm:max-w-[420px] gap-6 border bg-background p-6 shadow-2xl sm:rounded-2xl"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Image width={40} height={40} src="/icon.svg" alt="Verendar Logo" className="h-10 w-auto" style={{ height: "auto" }} />
                  </div>

                  <DialogPrimitive.Title className="text-2xl font-bold tracking-tight text-foreground">
                    Đặt mật khẩu mới
                  </DialogPrimitive.Title>
                  <p className="mt-1 text-sm text-muted-foreground px-4">
                    Vui lòng nhập mật khẩu mới của bạn để tiếp tục.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        placeholder="Ít nhất 8 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10 h-11 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10 h-11 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {confirmPassword !== "" && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">Mật khẩu xác nhận không khớp</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      type="submit"
                      disabled={!newPassword || newPassword !== confirmPassword || isLoading}
                      className="w-full h-11 rounded-xl font-semibold"
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cập nhật mật khẩu"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-11 text-sm text-muted-foreground hover:bg-muted rounded-xl"
                      onClick={() => onOpenChange?.(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xl opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
