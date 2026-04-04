"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateUser, useUpdateUser, useUserById } from "@/hooks/useUsers";
import { CreateUserRequest, UpdateUserRequest } from "@/lib/api/services/fetchUsers";
import { toast } from "sonner";
import { Loader2, UserPlus, UserCog } from "lucide-react";
import { useMobile } from "@/hooks/useMobile";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface FormValues extends CreateUserRequest {
  emailVerified: boolean;
  phoneNumberVerified: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  userId?: string | null;
}

const ROLES = [
  { id: "User", label: "Người dùng" },
  { id: "Admin", label: "Quản trị viên" },
  { id: "GarageOwner", label: "Chủ gara" },
  { id: "Mechanic", label: "Thợ sửa chữa" },
  { id: "GarageManager", label: "Quản lý gara" },
];

export function UserFormDialog({ open, onOpenChange, mode, userId }: UserFormDialogProps) {
  const isMobile = useMobile();
  const { user: existingUser, isLoading: isLoadingUser } = useUserById(userId || "", mode === "edit" && !!userId && open);
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      dateOfBirth: "",
      gender: "Male",
      roles: ["User"],
      emailVerified: false,
      phoneNumberVerified: false,
    }
  });

  const selectedRoles = watch("roles") || [];
  const gender = watch("gender");

  useEffect(() => {
    if (mode === "edit" && existingUser && open) {
      reset({
        fullName: existingUser.userName || "",
        email: existingUser.email || "",
        phoneNumber: existingUser.phoneNumber || "",
        password: "", // Don't pre-fill password
        dateOfBirth: existingUser.dateOfBirth ? existingUser.dateOfBirth.split("T")[0] : "",
        gender: existingUser.gender || "Male",
        roles: existingUser.roles || ["User"],
        emailVerified: existingUser.emailVerified || false,
        phoneNumberVerified: existingUser.phoneNumberVerified || false,
      });
    } else if (mode === "create" && open) {
      reset({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        dateOfBirth: "",
        gender: "Male",
        roles: ["User"],
        emailVerified: false,
        phoneNumberVerified: false,
      });
    }
  }, [mode, existingUser, open, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (mode === "create") {
        await createUser.mutateAsync(data as CreateUserRequest);
        toast.success("Tạo người dùng thành công");
      } else {
        await updateUser.mutateAsync({ id: userId!, data: data as UpdateUserRequest });
        toast.success("Cập nhật người dùng thành công");
      }
      onOpenChange(false);
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Đã có lỗi xảy ra");
    }
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setValue("roles", [...selectedRoles, roleId]);
    } else {
      setValue("roles", selectedRoles.filter((id: string) => id !== roleId));
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  const content = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input 
            id="fullName" 
            placeholder="Nguyễn Văn A" 
            {...register("fullName", { required: "Vui lòng nhập họ tên" })}
            className={cn(errors.fullName && "border-destructive")}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="example@gmail.com" 
            {...register("email", { 
              required: "Vui lòng nhập email",
              pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
            })}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          
          {mode === "edit" && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id="emailVerified" 
                checked={watch("emailVerified")} 
                onCheckedChange={(checked) => setValue("emailVerified", !!checked)} 
              />
              <Label htmlFor="emailVerified" className="text-xs font-normal">Đã xác thực email</Label>
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Số điện thoại</Label>
          <Input 
            id="phoneNumber" 
            placeholder="0987654321" 
            {...register("phoneNumber", { 
              required: "Vui lòng nhập số điện thoại",
              pattern: { value: /^[0-9]{10}$/, message: "Số điện thoại phải có 10 chữ số" }
            })}
            className={cn(errors.phoneNumber && "border-destructive")}
          />
          {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>}

          {mode === "edit" && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id="phoneNumberVerified" 
                checked={watch("phoneNumberVerified")} 
                onCheckedChange={(checked) => setValue("phoneNumberVerified", !!checked)} 
              />
              <Label htmlFor="phoneNumberVerified" className="text-xs font-normal">Đã xác thực số điện thoại</Label>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Mật khẩu {mode === "edit" && <span className="text-xs font-normal text-muted-foreground">(Để trống nếu không đổi)</span>}
          </Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            {...register("password", { 
              required: mode === "create" ? "Vui lòng nhập mật khẩu" : false,
              validate: (value) => {
                if (mode === "edit" && !value) return true;
                if (!value) return "Vui lòng nhập mật khẩu";
                const val = value as string;
                if (val.length < 8) return "Mật khẩu tối thiểu 8 ký tự";
                if (!/[A-Z]/.test(val)) return "Mật khẩu phải chứa ít nhất 1 ký tự viết hoa";
                if (!/[0-9]/.test(val)) return "Mật khẩu phải chứa ít nhất 1 chữ số";
                return true;
              }
            })}
            className={cn(errors.password && "border-destructive")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
            <Input 
              id="dateOfBirth" 
              type="date" 
              {...register("dateOfBirth", {
                required: "Vui lòng nhập ngày sinh",
                validate: (value) => {
                  if (!value) return true;
                  const birthDate = new Date(value as string);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const m = today.getMonth() - birthDate.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  return age >= 16 || "Người dùng phải đủ 16 tuổi";
                }
              })} 
            />
            {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Giới tính</Label>
            <Select 
              value={gender ?? undefined} 
              onValueChange={(val) => setValue("gender", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Nam</SelectItem>
                <SelectItem value="Female">Nữ</SelectItem>
                <SelectItem value="Other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Roles */}
        <div className="space-y-3">
          <Label>Vai trò hệ thống</Label>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-3 rounded-xl border border-border/50 bg-muted/20">
            {ROLES.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`role-${role.id}`} 
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => handleRoleChange(role.id, !!checked)}
                />
                <Label 
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/10 border-t mt-auto">
        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6"
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            className="rounded-xl px-8" 
            disabled={isPending || (mode === "edit" && isLoadingUser)}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              mode === "create" ? "Tạo người dùng" : "Cập nhật"
            )}
          </Button>
        </div>
      </div>
    </form>
  );

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
                  "fixed z-50 grid w-full gap-0 border bg-background shadow-lg overflow-hidden",
                  isMobile
                    ? "inset-x-0 bottom-0 h-[90vh] rounded-t-2xl rounded-b-none p-0"
                    : "left-[50%] top-[50%] h-fit max-h-[95vh] sm:rounded-xl sm:max-w-2xl p-0"
                )}
              >
                <div className="flex flex-col h-full max-h-[90vh]">
                  {/* Header */}
                  <div className="p-6 border-b bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                        {mode === "create" ? <UserPlus className="size-6" /> : <UserCog className="size-6" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-foreground">
                          {mode === "create" ? "Tạo người dùng mới" : "Cập nhật người dùng"}
                        </DialogPrimitive.Title>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {mode === "create" 
                            ? "Thêm thông tin tài khoản mới vào hệ thống." 
                            : `Đang chỉnh sửa: ${existingUser?.userName || (userId ?? "")}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="relative flex-1 overflow-hidden">
                    {mode === "edit" && isLoadingUser ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <Loader2 className="size-8 animate-spin text-primary" />
                      </div>
                    ) : null}
                    {content}
                  </div>
                </div>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none disabled:pointer-events-none">
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
