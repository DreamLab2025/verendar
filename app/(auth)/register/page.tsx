"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CarFront, Eye, EyeOff, Loader2, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpDialog } from "@/components/dialog/auth/OtpDialog";

export default function RegisterPage() {
  const router = useRouter();
  const { register, verifyOtp, resendOtp, loading, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setFieldErrors({ email: "", phoneNumber: "", password: "", confirmPassword: "" });

    let hasError = false;
    const newErrors = { email: "", phoneNumber: "", password: "", confirmPassword: "" };

    // Validation
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedPhone || !/^0(3|5|7|8|9)\d{8}$/.test(trimmedPhone)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (phải là số Việt Nam 10 chữ số).";
      hasError = true;
    }

    if (!/[A-Z]/.test(password)) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 ký tự viết hoa.";
      hasError = true;
    } else if (!/\d/.test(password)) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ số.";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    const result = await register(trimmedEmail, password, trimmedPhone);
    if (result.success) {
      setIsOtpOpen(true);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    const result = await verifyOtp(email, otp);
    if (result.success) {
      setIsOtpOpen(false);
      router.push("/login");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 via-background to-background" />

      <Card className="relative z-10 w-full max-w-md border-border/70 bg-background/85 shadow-xl backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <CarFront className="size-6" />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
            <CardDescription>Tham gia cùng Verendar ngay hôm nay.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn("pl-10", fieldErrors.email && "border-destructive")}
                  required
                />
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {fieldErrors.email && <p className="text-xs font-medium text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0987654321"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={cn("pl-10", fieldErrors.phoneNumber && "border-destructive")}
                  required
                />
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {fieldErrors.phoneNumber && <p className="text-xs font-medium text-destructive">{fieldErrors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn("pr-10", fieldErrors.password && "border-destructive")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs font-medium text-destructive">{fieldErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn("pr-10", fieldErrors.confirmPassword && "border-destructive")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs font-medium text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </CardContent>
      </Card>

      <OtpDialog
        open={isOtpOpen}
        onOpenChange={setIsOtpOpen}
        email={email}
        onVerify={handleVerifyOtp}
        onResend={() => resendOtp(email)}
        isLoading={loading}
      />
    </main>
  );
}
