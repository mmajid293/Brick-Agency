import type { Role } from "@prisma/client";
import { ROLE_NAV } from "./roles";

function dashboardSegment(pathname: string): string {
  const rest = pathname.replace(/^\/dashboard\/?/, "");
  const seg = rest.split("/")[0];
  return seg || "dashboard";
}

export function canAccessDashboardPath(role: Role, pathname: string): boolean {
  const allowed = ROLE_NAV[role];
  if (allowed.includes("*")) return true;

  const seg = dashboardSegment(pathname);
  if (allowed.includes(seg)) return true;
  if (seg === "portal" && (allowed.includes("portal") || allowed.includes("workerPortal"))) return true;

  if (seg === "workers" && allowed.includes("workers")) return true;
  if (seg === "attendance" && allowed.includes("attendance")) return true;
  if (seg === "dispatch" && allowed.includes("dispatch")) return true;
  if (seg === "kilns" && allowed.includes("kilns")) return true;

  return false;
}

export function getDashboardMinRole(pathname: string): Role {
  if (pathname.startsWith("/dashboard/audit")) return "ADMIN";
  if (pathname.startsWith("/dashboard/settings")) return "WORKER";
  if (pathname.startsWith("/dashboard/portal")) return "WORKER";
  if (pathname.startsWith("/dashboard/finance")) return "ACCOUNTANT";
  if (pathname.startsWith("/dashboard/payroll")) return "ACCOUNTANT";
  if (pathname.startsWith("/dashboard/agents")) return "MANAGER";
  if (pathname.startsWith("/dashboard/rates")) return "MANAGER";
  if (pathname.startsWith("/dashboard/invoices")) return "ACCOUNTANT";
  return "WORKER";
}

export function getLoginRedirect(role: Role): string {
  if (role === "WORKER") return "/dashboard/portal";
  return "/dashboard";
}

export function workerForbiddenRedirect(role: Role): string {
  if (role === "WORKER") return "/dashboard/portal";
  return "/dashboard";
}
