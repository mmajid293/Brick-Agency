import type { WorkerJobRole } from "@prisma/client";
import {
  WORKER_CATEGORIES,
  categoryLabel,
  legacyRoleToCategory,
  type WorkerCategoryCode,
} from "./worker-categories";

/** @deprecated Use WORKER_CATEGORIES — kept for backward compatibility */
export const WORKER_JOB_ROLES = WORKER_CATEGORIES.map((c) => ({
  value: c.legacyJobRole,
  labelEn: c.nameEn,
  labelUr: c.nameUr,
  department: c.departmentCode,
  categoryCode: c.code,
}));

export function workerJobRoleLabel(roleOrCategory: string, locale: "en" | "ur" = "en") {
  const byCat = categoryLabel(roleOrCategory, locale);
  if (byCat !== roleOrCategory) return byCat;
  const row = WORKER_JOB_ROLES.find((r) => r.value === roleOrCategory);
  if (!row) return roleOrCategory;
  return locale === "ur" ? row.labelUr : row.labelEn;
}

export function departmentForJobRole(role: WorkerJobRole) {
  const code = legacyRoleToCategory(role);
  return WORKER_CATEGORIES.find((c) => c.code === code)?.departmentCode ?? "PRODUCTION";
}

export function categoryCodeForJobRole(role: WorkerJobRole): WorkerCategoryCode {
  return legacyRoleToCategory(role);
}
