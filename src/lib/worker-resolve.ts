import type { PrismaClient } from "@prisma/client";
import type { z } from "zod";
import type { workerSchema } from "./validations";
import {
  categoryByCode,
  legacyRoleToCategory,
  resolveCategoryCode,
} from "./worker-categories";
import { departmentLabel } from "./departments";
import type { WorkerJobRole } from "@prisma/client";

type WorkerInput = z.infer<typeof workerSchema> & { standardHoursPerDay?: number };

export async function resolveWorkerClassification(
  prisma: PrismaClient,
  data: WorkerInput
) {
  let categoryCode =
    data.categoryCode ??
    (data.jobRole ? legacyRoleToCategory(data.jobRole as WorkerJobRole) : "BRICK_MOLDING");

  if (data.categoryId) {
    const cat = await prisma.workerCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (cat) categoryCode = cat.code as typeof categoryCode;
  }

  const resolved = resolveCategoryCode(categoryCode);
  if (!resolved) {
    categoryCode = "GENERAL_HELPER";
  } else {
    categoryCode = resolved;
  }

  const def = categoryByCode(categoryCode)!;
  const category = await prisma.workerCategory.findUnique({
    where: { code: categoryCode },
    include: { department: true },
  });

  if (!category) {
    throw new Error("Worker categories not seeded. Run: npm run db:setup");
  }

  const departmentId = data.departmentId ?? category.departmentId;
  const departmentName =
    data.department ??
    category.department.nameEn ??
    departmentLabel(category.department.code, "en");

  const wageType = data.wageType ?? category.wageType;
  const jobRole = (data.jobRole ?? category.legacyJobRole ?? "OTHER") as WorkerJobRole;

  return {
    categoryId: category.id,
    departmentId,
    department: departmentName,
    categoryCode,
    wageType,
    jobRole,
    shiftType: data.shiftType ?? category.defaultShift ?? null,
    skillLevel: data.skillLevel ?? "SKILLED",
    dailyTarget: data.dailyTarget ?? data.bricksTargetPerDay ?? category.defaultTarget ?? null,
    dailyWage: data.dailyWage ?? Number(category.defaultDailyWage),
    perBrickRate: data.perBrickRate ?? Number(category.defaultPerBrick),
    monthlySalary: data.monthlySalary ?? Number(category.defaultMonthly),
    perTruckRate: data.perTruckRate ?? Number(category.defaultPerTruck),
    bricksTargetPerDay:
      data.bricksTargetPerDay ??
      (wageType === "PER_THOUSAND_BRICKS" ? category.defaultTarget : null),
  };
}
