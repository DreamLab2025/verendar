import {
  ROLE_ADMIN,
  ROLE_GARAGE_MANAGER,
  ROLE_GARAGE_MECHANIC,
  ROLE_GARAGE_OWNER,
  ROLE_USER,
  type UserRole,
} from "@/lib/types/roles";

export const ADMIN_HOME_ROUTE = "/admin/dashboard";
export const USER_HOME_ROUTE = "/";
export const GARAGE_HOME_ROUTE = "/garage";

const ROLE_ALIAS_MAP: Record<string, UserRole> = {
  admin: ROLE_ADMIN,
  user: ROLE_USER,
  garageowner: ROLE_GARAGE_OWNER,
  garage_owner: ROLE_GARAGE_OWNER,
  garagemanager: ROLE_GARAGE_MANAGER,
  garage_manager: ROLE_GARAGE_MANAGER,
  mechanic: ROLE_GARAGE_MECHANIC,
};

function toCanonicalRole(role: string): UserRole | null {
  const trimmed = role.trim();
  if (!trimmed) return null;
  const alias = ROLE_ALIAS_MAP[trimmed.toLowerCase()];
  return alias ?? (trimmed as UserRole);
}

export function normalizeJwtRolesClaim(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    return [raw.trim()];
  }
  return [];
}

export function normalizeUserRoles(roles: string[]): UserRole[] {
  const normalized = roles
    .map((role) => toCanonicalRole(role))
    .filter((role): role is UserRole => role !== null);

  return Array.from(new Set(normalized));
}

export function hasAdminRole(roles: string[]): boolean {
  return normalizeUserRoles(roles).includes(ROLE_ADMIN);
}

export function hasGarageRole(roles: string[]): boolean {
  return normalizeUserRoles(roles).some(
    (role) => role === ROLE_GARAGE_OWNER || role === ROLE_GARAGE_MANAGER || role === ROLE_GARAGE_MECHANIC,
  );
}

export function resolveHomeRouteFromRoles(roles: string[]): string {
  const normalized = normalizeUserRoles(roles);

  if (normalized.includes(ROLE_ADMIN)) return ADMIN_HOME_ROUTE;
  if (hasGarageRole(normalized)) return GARAGE_HOME_ROUTE;
  if (normalized.includes(ROLE_USER)) return USER_HOME_ROUTE;

  // Fallback for authenticated roles outside current mapping.
  return GARAGE_HOME_ROUTE;
}

export function getPrimaryRoleFromRoles(roles: string[]): UserRole | null {
  const normalized = normalizeUserRoles(roles);

  if (normalized.includes(ROLE_ADMIN)) return ROLE_ADMIN;
  if (normalized.includes(ROLE_GARAGE_OWNER)) return ROLE_GARAGE_OWNER;
  if (normalized.includes(ROLE_GARAGE_MANAGER)) return ROLE_GARAGE_MANAGER;
  if (normalized.includes(ROLE_GARAGE_MECHANIC)) return ROLE_GARAGE_MECHANIC;
  if (normalized.includes(ROLE_USER)) return ROLE_USER;

  return normalized[0] ?? null;
}
