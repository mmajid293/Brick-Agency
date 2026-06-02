import type { Role } from "@prisma/client";

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 5,
  MANAGER: 4,
  ACCOUNTANT: 3,
  SUPERVISOR: 2,
  WORKER: 1,
};

export function canAccess(userRole: Role, requiredRole: Role) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export const ROLE_NAV: Record<Role, string[]> = {
  ADMIN: ["*"],
  MANAGER: ["*"],
  ACCOUNTANT: [
    "dashboard",
    "today",
    "customers",
    "finance",
    "payroll",
    "reports",
    "agents",
    "rates",
    "invoices",
    "settings",
    "portal",
    "workerPortal",
  ],
  SUPERVISOR: [
    "dashboard",
    "today",
    "workers",
    "attendance",
    "inventory",
    "production",
    "materials",
    "dispatch",
    "kilns",
    "vehicles",
    "portal",
    "settings",
  ],
  WORKER: ["dashboard", "portal", "workerPortal", "settings"],
};
