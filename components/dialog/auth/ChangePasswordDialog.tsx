"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  const [error, setError] = useState("");

  const passwordsMatch = newPassword === confirmPassword;
  const isValid = newPassword.length >= 8 && passwordsMatch && newPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (!confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!passwordsMatch) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    onSuccess(newPassword);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setShowNew(false);
      setShowConfirm(false);
    }
    onOpenChange?.(value);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80"
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 grid w-full sm:max-w-[400px] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
                )}
              >
                {/* Header */}
                <div className="flex flex-col space-y-1.5 text-center mb-2">
                  <div className="flex justify-center mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <DialogPrimitive.Title className="text-xl font-bold text-primary">
                    Đặt mật khẩu mới
                  </DialogPrimitive.Title>
                  <p className="text-sm text-muted-foreground">Vui lòng nhập mật khẩu mới của bạn để tiếp tục.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* New Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">
                      Mật khẩu mới <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        placeholder="Ít nhất 8 ký tự"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPassword.length > 0 && newPassword.length < 8 && (
                      <p className="text-xs text-destructive">Mật khẩu phải có ít nhất 8 ký tự</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">
                      Xác nhận mật khẩu <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive">Mật khẩu xác nhận không khớp</p>
                    )}
                  </div>

                  {/* Global error */}
                  {error && <p className="text-xs text-destructive text-center">{error}</p>}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-2">
                    <Button type="submit" disabled={!isValid || isLoading} className="w-full">
                      {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-sm text-muted-foreground hover:bg-gray-200 hover:text-black"
                      onClick={() => handleOpenChange(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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
