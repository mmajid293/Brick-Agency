"use client";

import { createContext, useContext } from "react";
import type { Role } from "@prisma/client";

const RoleContext = createContext<Role>("WORKER");

export function RoleProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useUserRole() {
  return useContext(RoleContext);
}
