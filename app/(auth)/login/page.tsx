"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CarFront, Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveHomeRouteFromRoles } from "@/lib/auth/role-routing";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, accessToken, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (accessToken && user?.role) {
      router.replace(resolveHomeRouteFromRoles([user.role]));
    }
  }, [accessToken, router, user?.role]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const result = await login(email.trim(), password);
    if (result.success) {
      router.replace(resolveHomeRouteFromRoles(result.user?.role ? [result.user.role] : []));
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
            <CardTitle className="text-2xl">Đăng nhập Verendar</CardTitle>
            <CardDescription>Đăng nhập để tiếp tục quản lý phương tiện của bạn.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
