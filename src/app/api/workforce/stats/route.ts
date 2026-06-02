import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { startOfDay } from "date-fns";
import { DEPARTMENTS } from "@/lib/departments";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const dateParam = new URL(req.url).searchParams.get("date");
      const day = dateParam ? startOfDay(new Date(dateParam)) : startOfDay(new Date());

      const [workers, todayRecords, categories] = await Promise.all([
        prisma.worker.findMany({
          where: { isActive: true },
          select: {
            id: true,
            categoryId: true,
            departmentId: true,
            wageType: true,
            category: { select: { code: true, attendanceMode: true, department: { select: { code: true } } } },
          },
        }),
        prisma.attendance.findMany({
          where: { date: day },
          select: { workerId: true, status: true },
        }),
        prisma.workerCategory.findMany({
          where: { isActive: true },
          include: { department: true },
          orderBy: { sortOrder: "asc" },
        }),
      ]);

      const presentSet = new Set(
        todayRecords
          .filter((r) => ["PRESENT", "OVERTIME", "HALF_DAY"].includes(r.status))
          .map((r) => r.workerId)
      );

      const byDepartment = DEPARTMENTS.map((d) => {
        const deptWorkers = workers.filter(
          (w) => w.category?.department?.code === d.code || false
        );
        const present = deptWorkers.filter((w) => presentSet.has(w.id)).length;
        return {
          code: d.code,
          nameEn: d.nameEn,
          nameUr: d.nameUr,
          workerCount: deptWorkers.length,
          presentToday: present,
        };
      });

      const byAttendanceMode = ["PRODUCTION", "SHIFT", "TRIP", "STANDARD", "TEAM_MONITOR"].map(
        (mode) => {
          const group = workers.filter((w) => w.category?.attendanceMode === mode);
          return {
            mode,
            workerCount: group.length,
            presentToday: group.filter((w) => presentSet.has(w.id)).length,
          };
        }
      );

      const byWageType = ["DAILY", "MONTHLY", "PER_THOUSAND_BRICKS", "PER_TRUCK", "SHIFT"].map(
        (wt) => ({
          wageType: wt,
          workerCount: workers.filter((w) => w.wageType === wt).length,
        })
      );

      return apiSuccess({
        date: day.toISOString(),
        totalWorkers: workers.length,
        presentToday: presentSet.size,
        byDepartment,
        byAttendanceMode,
        byWageType,
        categories: categories.map((c) => ({
          ...c,
          workerCount: workers.filter((w) => w.categoryId === c.id).length,
          presentToday: workers.filter((w) => w.categoryId === c.id && presentSet.has(w.id)).length,
        })),
      });
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  });
}
