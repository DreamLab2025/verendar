"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useUserById } from "@/hooks/useUsers";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import {
  XCircle,
  Fingerprint,
  Mail,
  Phone,
  Shield,
  Calendar,
  Contact,
  Cake,
  UserRound,
  X,
  LucideIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_MAP, getInitials } from "@/features/users-management/admin-users-list";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

const GENDER_MAP: Record<string, string> = {
  Male: "Nam",
  Female: "Nữ",
  Other: "Khác",
};

export function UserDetailDialog({ open, onOpenChange, userId }: UserDetailDialogProps) {
  const isMobile = useMobile();
  const { user, isLoading, isError } = useUserById(userId || "", open);

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
                className="fixed inset-0 z-50 bg-black/80"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content aria-describedby={undefined} asChild>
              <motion.div
                initial={
                  isMobile
                    ? { opacity: 0, y: "100%" }
                    : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }
                }
                animate={
                  isMobile
                    ? { opacity: 1, y: "0%" }
                    : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
                }
                exit={
                  isMobile
                    ? { opacity: 0, y: "100%" }
                    : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed z-50 grid w-full gap-0 border bg-background shadow-lg overflow-y-auto",
                  isMobile
                    ? "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl rounded-b-none p-0"
                    : "left-[50%] top-[50%] max-h-[90vh] sm:rounded-lg sm:max-w-lg p-0"
                )}
              >
                <div className="flex flex-col w-full">
                  {/* Simple Header */}
                  <div className="p-6 border-b bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                        {isLoading ? <Skeleton className="size-full rounded-xl" /> : getInitials(user?.userName || "")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <DialogPrimitive.Title className="text-xl font-bold tracking-tight mb-1 truncate text-foreground">
                          Chi tiết người dùng
                        </DialogPrimitive.Title>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                          ID: {userId}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simple Content List - 2 Grid Layout */}
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 bg-background">
                    {isLoading ? (
                      <div className="col-span-full space-y-4 py-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                      </div>
                    ) : isError ? (
                      <div className="col-span-full text-center py-8 space-y-3">
                        <XCircle className="size-10 text-destructive/40 mx-auto" />
                        <p className="text-sm text-muted-foreground font-medium">Không thể tải thông tin chi tiết.</p>
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Đóng</Button>
                      </div>
                    ) : user ? (
                      <>
                        <DataRow icon={Contact} label="Tên người dùng" value={user.userName} />
                        <DataRow
                          icon={Mail}
                          label="Email"
                          value={user.email}
                          subValue={
                            user.emailVerified ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">Xác thực</span>
                            ) : (
                              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold">Chưa</span>
                            )
                          }
                        />
                        <DataRow
                          icon={Phone}
                          label="Số điện thoại"
                          value={user.phoneNumber || "N/A"}
                          subValue={
                            user.phoneNumberVerified ? (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">Xác thực</span>
                            ) : (
                              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold">Chưa</span>
                            )
                          }
                        />
                        <DataRow
                          icon={Cake}
                          label="Ngày sinh"
                          value={user.dateOfBirth ? dayjs(user.dateOfBirth).format("DD/MM/YYYY") : "Chưa cập nhật"}
                        />
                        <DataRow
                          icon={UserRound}
                          label="Giới tính"
                          value={user.gender ? (GENDER_MAP[user.gender] || user.gender) : "Chưa cập nhật"}
                        />
                        <DataRow
                          icon={Calendar}
                          label="Ngày tham gia"
                          value={dayjs(user.createdAt).format("DD/MM/YYYY")}
                          subValue={<span className="text-[10px] text-muted-foreground font-mono">{dayjs(user.createdAt).format("HH:mm")}</span>}
                        />
                        <div className="col-span-full pt-2">
                          <DataRow
                            icon={Shield}
                            label="Vai trò hệ thống"
                            value={
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {user.roles.map(role => (
                                  <Badge key={role} variant="secondary" className="text-[10px] font-extrabold bg-primary/5 text-primary border-primary/20 rounded-md py-0 px-2 h-5">
                                    {ROLE_MAP[role] || role}
                                  </Badge>
                                ))}
                              </div>
                            }
                          />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Simple Footer */}
                  {!isMobile && (
                    <div className="p-4 bg-muted/10 border-t flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-semibold h-9 px-6 transition-colors hover:bg-background"
                      >
                        Đóng
                      </Button>
                    </div>
                  )}
                </div>

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

interface DataRowProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
}

function DataRow({ icon: Icon, label, value, subValue }: DataRowProps) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border/40 last:border-0 group">
      <div className="size-8 rounded-lg bg-muted/50 text-muted-foreground flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">{label}</p>
        <div className="flex items-center flex-wrap gap-2">
          {typeof value === 'string' ? (
            <p className="text-sm font-semibold text-foreground truncate">{value}</p>
          ) : (
            value
          )}
          {subValue}
        </div>
      </div>
    </div>
  );
}
