"use client";

import { canAccess } from "@/lib/roles";
import type { Role } from "@prisma/client";

export function useCanAccess(role: Role, minRole: Role) {
  return canAccess(role, minRole);
}
