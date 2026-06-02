import { PrismaClient } from "@prisma/client";
import { DEPARTMENTS } from "../src/lib/departments";
import { WORKER_CATEGORIES } from "../src/lib/worker-categories";

export async function seedDepartmentsAndCategories(prisma: PrismaClient) {
  const deptMap = new Map<string, string>();

  for (const d of DEPARTMENTS) {
    const row = await prisma.department.upsert({
      where: { code: d.code },
      create: {
        code: d.code,
        nameEn: d.nameEn,
        nameUr: d.nameUr,
        description: d.descriptionEn,
        sortOrder: d.sortOrder,
      },
      update: {
        nameEn: d.nameEn,
        nameUr: d.nameUr,
        description: d.descriptionEn,
        sortOrder: d.sortOrder,
      },
    });
    deptMap.set(d.code, row.id);
  }

  const catMap = new Map<string, string>();

  for (const c of WORKER_CATEGORIES) {
    const departmentId = deptMap.get(c.departmentCode);
    if (!departmentId) continue;

    const row = await prisma.workerCategory.upsert({
      where: { code: c.code },
      create: {
        code: c.code,
        nameEn: c.nameEn,
        nameUr: c.nameUr,
        descriptionEn: c.descriptionEn,
        descriptionUr: c.descriptionUr,
        departmentId,
        wageType: c.wageType,
        attendanceMode: c.attendanceMode,
        legacyJobRole: c.legacyJobRole,
        defaultDailyWage: c.defaultDailyWage,
        defaultPerBrick: c.defaultPerBrick,
        defaultPerTruck: c.defaultPerTruck,
        defaultMonthly: c.defaultMonthly,
        defaultShift: c.defaultShift ?? null,
        defaultTarget: c.defaultTarget ?? null,
        iconKey: c.iconKey,
        colorKey: c.colorKey,
        sortOrder: c.sortOrder,
      },
      update: {
        nameEn: c.nameEn,
        nameUr: c.nameUr,
        descriptionEn: c.descriptionEn,
        descriptionUr: c.descriptionUr,
        departmentId,
        wageType: c.wageType,
        attendanceMode: c.attendanceMode,
        legacyJobRole: c.legacyJobRole,
        defaultDailyWage: c.defaultDailyWage,
        defaultPerBrick: c.defaultPerBrick,
        defaultPerTruck: c.defaultPerTruck,
        defaultMonthly: c.defaultMonthly,
        defaultShift: c.defaultShift ?? null,
        defaultTarget: c.defaultTarget ?? null,
        iconKey: c.iconKey,
        colorKey: c.colorKey,
        sortOrder: c.sortOrder,
      },
    });
    catMap.set(c.code, row.id);
  }

  return { deptMap, catMap };
}
