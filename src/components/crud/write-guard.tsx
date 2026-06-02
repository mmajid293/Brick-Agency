"use client";

import type { Role } from "@prisma/client";
import { useUserRole } from "@/context/role-context";
import { canAccess } from "@/lib/roles";

export function WriteGuard({
  minRole = "SUPERVISOR",
  children,
  fallback = null,
}: {
  minRole?: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const role = useUserRole();
  if (!canAccess(role, minRole)) return <>{fallback}</>;
  return <>{children}</>;
}
