export const ROLE_ADMIN = "Admin";
export const ROLE_USER = "User";
export const ROLE_GARAGE_OWNER = "GarageOwner";
export const ROLE_GARAGE_MANAGER = "GarageManager";
export const ROLE_GARAGE_MECHANIC = "Mechanic";

export type UserRole =
	| typeof ROLE_ADMIN
	| typeof ROLE_USER
	| typeof ROLE_GARAGE_OWNER
	| typeof ROLE_GARAGE_MANAGER
	| typeof ROLE_GARAGE_MECHANIC;
