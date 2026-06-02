import type { Role } from "@prisma/client";
import { canAccess } from "./roles";

/** Minimum role required for API routes. */
export const API_MIN_ROLE: Record<string, Role> = {
  default: "WORKER",
  write: "SUPERVISOR",
  finance: "ACCOUNTANT",
  admin: "ADMIN",
};

export function roleCanAccessApi(userRole: Role, minRole: Role): boolean {
  return canAccess(userRole, minRole);
}

export function roleCanWrite(userRole: Role, minRole: Role = "SUPERVISOR"): boolean {
  return canAccess(userRole, minRole);
}
