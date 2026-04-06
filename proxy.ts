import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import {
  GARAGE_HOME_ROUTE,
  USER_HOME_ROUTE,
  hasAdminRole,
  hasGarageRole,
  normalizeJwtRolesClaim,
  resolveHomeRouteFromRoles,
} from "@/lib/auth/role-routing";

const BYPASS_AUTH_FOR_UI_TEST = false;

const KNOWN_APP_ROUTE_PATTERNS = [
  "/",
  "/admin/dashboard",
  "/admin/feedback",
  "/admin/users",
  "/garage",
  "/garage-dashboard",
  "/notifications",
  "/settings",
  "/feedback",
  "/user",
  "/vehicle",
  "/proposal",
];

const routeMatches = (pathname: string, route: string) =>
  route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`);

const isKnownAppRoute = (pathname: string) =>
  KNOWN_APP_ROUTE_PATTERNS.some((route) => routeMatches(pathname, route));

const getUserRoles = (token: string | undefined): string[] => {
  if (!token) return [];
  try {
    const decoded = jwtDecode(token) as {
      role?: string | string[];
      exp?: number;
    } | null;

    if (!decoded) return [];
    return normalizeJwtRolesClaim(decoded.role);
  } catch {
    return [];
  }
};

export function proxy(request: NextRequest) {
  if (BYPASS_AUTH_FOR_UI_TEST) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.endsWith(".xml") || pathname.endsWith(".json")) return NextResponse.next();

  const token = request.cookies.get("authToken")?.value;
  const userRoles = getUserRoles(token);
  const homeRoute = resolveHomeRouteFromRoles(userRoles);

  const publicRoutes: string[] = [];
  const authRoutes = ["/login", "/register", "/forgot-password"];

  const isPublicRoute = publicRoutes.some((r) => routeMatches(pathname, r));
  const isAuthRoute = authRoutes.some((r) => routeMatches(pathname, r));

  if (!token || userRoles.length === 0) {
    if (isPublicRoute || isAuthRoute) return NextResponse.next();
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (token) res.cookies.delete("authToken");
    return res;
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isGarageRoute = pathname === GARAGE_HOME_ROUTE || pathname.startsWith(`${GARAGE_HOME_ROUTE}/`);
  const isAdmin = hasAdminRole(userRoles);
  const isGarageMember = hasGarageRole(userRoles);

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(homeRoute, request.url));
  }

  if (pathname === "/" || pathname === "") {
    if (homeRoute !== USER_HOME_ROUTE) {
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }
    return NextResponse.next();
  }

  if (!isKnownAppRoute(pathname)) {
    return NextResponse.redirect(new URL(homeRoute, request.url));
  }

  if (isAdmin) {
    if (isGarageRoute) {
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    return NextResponse.redirect(new URL(homeRoute, request.url));
  }

  if (isGarageRoute && !isGarageMember) {
    return NextResponse.redirect(new URL(USER_HOME_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|xml|glb)$).*)",
  ],
};
