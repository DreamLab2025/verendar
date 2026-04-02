/** Claim role từ token — đồng bộ với BE. */
export const GARAGE_PORTAL_ROLE_OWNER = "GarageOwner";
export const GARAGE_PORTAL_ROLE_MANAGER = "GarageManager";
export const GARAGE_PORTAL_ROLE_MECHANIC = "Mechanic";

export type GaragePortalView = "owner" | "branchStaff";

/**
 * GarageOwner → UI đầy đủ (sidebar + garage + danh sách chi nhánh).
 * GarageManager / Mechanic (và không phải Owner) → chỉ chi nhánh, không sidebar.
 * Các role khác → giữ hành vi owner (tương thích ngược).
 */
export function getGaragePortalViewFromRoles(roles: string[]): GaragePortalView {
  if (roles.includes(GARAGE_PORTAL_ROLE_OWNER)) return "owner";
  if (roles.includes(GARAGE_PORTAL_ROLE_MANAGER) || roles.includes(GARAGE_PORTAL_ROLE_MECHANIC)) {
    return "branchStaff";
  }
  return "owner";
}
