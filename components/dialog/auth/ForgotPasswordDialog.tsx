"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Mail, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ForgotPasswordDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: (email: string) => void;
  isLoading?: boolean;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  onSuccess,
  isLoading,
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");

  // Reset email when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => setEmail(""), 300);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSuccess(email.trim());
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
                    <Image width={40} height={40} src="/icon.svg" alt="Verendar Logo" className="h-10 w-auto" style={{ width: "auto" }} />
                  </div>

                  <DialogPrimitive.Title className="text-2xl font-bold tracking-tight text-foreground">
                    Quên mật khẩu
                  </DialogPrimitive.Title>
                  <p className="mt-1 text-sm text-muted-foreground px-4">
                    Nhập email của bạn để bắt đầu khôi phục mật khẩu.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Địa chỉ email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        required
                        disabled={isLoading}
                      />
                      <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <Button type="submit" disabled={!email || isLoading} className="w-full h-11 rounded-xl font-semibold">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tiếp tục"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-11 text-sm text-muted-foreground hover:bg-muted rounded-xl"
                      onClick={() => onOpenChange?.(false)}
                    >
                      Quay lại đăng nhập
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
