import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const BYPASS_AUTH_FOR_UI_TEST = true;

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

const getPrimaryRole = (roles: string[]) => {
  if (roles.includes("admin")) return "admin";
  if (
    roles.includes("executive_board") ||
    roles.includes("vice_rector") ||
    roles.includes("campus_academic_director")
  ) {
    return "management";
  }
  if (roles.includes("department_head")) return "department_head";
  return "other";
};

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
  const authRoutes = ["/login"];

  const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!token || userRoles.length === 0) {
    if (isPublicRoute || isAuthRoute) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) res.cookies.delete("authToken");
    return res;
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isManagementRoute = pathname.startsWith("/manage-project");
  const isDepartmentHeadRoute = pathname.startsWith("/department-head");

  if (isAuthRoute || pathname === "/" || pathname === "") {
    if (primaryRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (primaryRole === "management") {
      return NextResponse.redirect(new URL("/manage-project", request.url));
    }
    if (primaryRole === "department_head") {
      return NextResponse.redirect(new URL("/department-head", request.url));
    }
    return NextResponse.redirect(new URL("/project", request.url));
  }

  if (primaryRole === "admin") {
    return NextResponse.next();
  }

  if (primaryRole === "management") {
    if (isAdminRoute || isDepartmentHeadRoute) {
      return NextResponse.redirect(new URL("/manage-project", request.url));
    }
    return NextResponse.next();
  }

  if (primaryRole === "department_head") {
    if (isAdminRoute || isManagementRoute) {
      return NextResponse.redirect(new URL("/department-head", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute || isManagementRoute || isDepartmentHeadRoute) {
    return NextResponse.redirect(new URL("/project", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
