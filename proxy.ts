import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const BYPASS_AUTH_FOR_UI_TEST = true;

const ADMIN_HOME = "/admin/dashboard";
const USER_HOME = "/";

const getUserRoles = (token: string | undefined): string[] => {
  if (!token) return [];
  try {
    const decoded = jwtDecode(token) as {
      role?: string | string[];
      exp?: number;
    } | null;

    if (!decoded?.role) return [];
    return Array.isArray(decoded.role) ? decoded.role : [decoded.role];
  } catch {
    return [];
  }
};

const isAdminRole = (roles: string[]) =>
  roles.some((r) => String(r).toLowerCase() === "admin");

const getPrimaryRole = (roles: string[]): "admin" | "user" =>
  isAdminRole(roles) ? "admin" : "user";

export function proxy(request: NextRequest) {
  if (BYPASS_AUTH_FOR_UI_TEST) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.endsWith(".xml") || pathname.endsWith(".json")) return NextResponse.next();

  const token = request.cookies.get("authToken")?.value;
  const userRoles = getUserRoles(token);
  const primaryRole = getPrimaryRole(userRoles);

  const publicRoutes: string[] = [];
  const authRoutes = ["/login", "/register", "/forgot-password"];

  const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!token || userRoles.length === 0) {
    if (isPublicRoute || isAuthRoute) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) res.cookies.delete("authToken");
    return res;
  }

  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute || pathname === "/" || pathname === "") {
    if (primaryRole === "admin") {
      return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
    }
    return NextResponse.redirect(new URL(USER_HOME, request.url));
  }

  if (primaryRole === "admin") {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    return NextResponse.redirect(new URL(USER_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
