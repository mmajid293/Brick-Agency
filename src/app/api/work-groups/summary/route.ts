import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { WORKER_CATEGORIES } from "@/lib/worker-categories";
import { startOfDay } from "date-fns";
import { legacyRoleToCategory } from "@/lib/worker-categories";
import type { WorkerJobRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const dateParam = new URL(req.url).searchParams.get("date");
      const departmentCode = new URL(req.url).searchParams.get("department");
      const day = dateParam ? startOfDay(new Date(dateParam)) : startOfDay(new Date());

      const [workers, todayRecords, dbCategories] = await Promise.all([
        prisma.worker.findMany({
          where: { isActive: true },
          select: {
            id: true,
            jobRole: true,
            categoryId: true,
            category: { select: { code: true, department: { select: { code: true, nameEn: true } } } },
          },
        }),
        prisma.attendance.findMany({
          where: { date: day },
          select: { workerId: true, status: true, checkIn: true, checkOut: true },
        }),
        prisma.workerCategory.findMany({
          where: { isActive: true },
          include: { department: true },
        }),
      ]);

      const recordByWorker = new Map(todayRecords.map((r) => [r.workerId, r]));

      const groups = WORKER_CATEGORIES.filter((def) => {
        if (!departmentCode) return true;
        return def.departmentCode === departmentCode;
      }).map((def) => {
        const dbCat = dbCategories.find((c) => c.code === def.code);
        const groupWorkers = workers.filter((w) => {
          if (w.category?.code) return w.category.code === def.code;
          return legacyRoleToCategory((w.jobRole || "OTHER") as WorkerJobRole) === def.code;
        });
        let present = 0;
        let checkedIn = 0;
        let checkedOut = 0;
        for (const w of groupWorkers) {
          const rec = recordByWorker.get(w.id);
          if (!rec) continue;
          if (["PRESENT", "OVERTIME", "HALF_DAY"].includes(rec.status)) present++;
          if (rec.checkIn) checkedIn++;
          if (rec.checkOut) checkedOut++;
        }
        return {
          role: def.code,
          code: def.code,
          labelEn: def.nameEn,
          labelUr: def.nameUr,
          department: dbCat?.department.nameEn ?? def.departmentCode,
          departmentCode: def.departmentCode,
          wageType: def.wageType,
          attendanceMode: def.attendanceMode,
          workerCount: groupWorkers.length,
          presentToday: present,
          checkedInToday: checkedIn,
          checkedOutToday: checkedOut,
        };
      });

      return apiSuccess({
        date: day.toISOString(),
        groups,
      });
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  });
}
