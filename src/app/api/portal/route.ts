import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { canAccess } from "@/lib/roles";
import { startOfDay, startOfMonth, endOfMonth } from "date-fns";

async function loadWorkerPortal(workerId: string) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const [worker, todayRecord, monthRows, attendances, payrolls, advances] = await Promise.all([
    prisma.worker.findUnique({ where: { id: workerId } }),
    prisma.attendance.findUnique({
      where: { workerId_date: { workerId, date: today } },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: {
        workerId,
        date: { gte: monthStart, lte: monthEnd },
      },
      _count: true,
    }),
    prisma.attendance.findMany({
      where: { workerId },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.payroll.findMany({
      where: { workerId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    }),
    prisma.advance.findMany({
      where: { workerId },
      orderBy: { date: "desc" },
      take: 15,
    }),
  ]);

  if (!worker) return null;

  const monthSummary = {
    present: 0,
    absent: 0,
    leave: 0,
    halfDay: 0,
    overtime: 0,
  };
  for (const row of monthRows) {
    if (row.status === "PRESENT") monthSummary.present = row._count;
    else if (row.status === "ABSENT") monthSummary.absent = row._count;
    else if (row.status === "LEAVE") monthSummary.leave = row._count;
    else if (row.status === "HALF_DAY") monthSummary.halfDay = row._count;
    else if (row.status === "OVERTIME") monthSummary.overtime = row._count;
  }

  return {
    mode: "worker" as const,
    managedBySupervisor: true,
    worker,
    today: todayRecord,
    monthSummary,
    attendances,
    payrolls,
    advances,
  };
}

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const asWorkerId = new URL(req.url).searchParams.get("workerId");

    try {
      if (user.workerId) {
        const self = await loadWorkerPortal(user.workerId);
        if (!self) return apiError("Worker profile not found", 404);
        return apiSuccess({ ...self, managedBySupervisor: false });
      }

      if (canAccess(user.role, "SUPERVISOR")) {
        if (asWorkerId) {
          const worker = await prisma.worker.findFirst({
            where: { id: asWorkerId, isActive: true },
          });
          if (!worker) return apiError("Worker not found", 404);
          const portal = await loadWorkerPortal(asWorkerId);
          if (!portal) return apiError("Worker profile not found", 404);
          return apiSuccess(portal);
        }

        const workers = await prisma.worker.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            nameUrdu: true,
            workerCode: true,
            jobRole: true,
            department: true,
          },
          orderBy: { name: "asc" },
        });

        return apiSuccess({
          mode: "picker",
          workers,
          hint:
            "Select a worker to view their portal, check in, and check out. To link your own login to a worker, go to Settings → Users.",
        });
      }

      return apiError(
        "No worker profile is linked to this account. Ask your admin to link you in Settings → Users.",
        404
      );
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  }, "WORKER");
}
