import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isProtectedRoute =
    pathname.startsWith("/user") ||
    pathname.startsWith("/vehicle") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/notifications");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/vehicle/:path*", "/admin/:path*", "/notifications/:path*", "/login", "/register", "/forgot-password"],
};
