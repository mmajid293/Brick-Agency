import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { payrollAutoSchema } from "@/lib/validations";
import {
  calculateWorkerPayroll,
  monthDateRange,
  type AttendanceRow,
  type WorkerPayInput,
} from "@/lib/payroll-calc";

async function loadMonthData(workerIds: string[], month: number, year: number) {
  const { start, end } = monthDateRange(month, year);

  const [workers, attendances, productionLogs, dispatchLogs] = await Promise.all([
    prisma.worker.findMany({
      where: { isActive: true, ...(workerIds.length ? { id: { in: workerIds } } : {}) },
      include: { category: { select: { wageType: true } } },
    }),
    prisma.attendance.findMany({
      where: {
        workerId: workerIds.length ? { in: workerIds } : undefined,
        date: { gte: start, lte: end },
      },
    }),
    prisma.workerProductionLog.findMany({
      where: {
        workerId: workerIds.length ? { in: workerIds } : undefined,
        date: { gte: start, lte: end },
      },
    }),
    prisma.workerDispatchLog.findMany({
      where: {
        workerId: workerIds.length ? { in: workerIds } : undefined,
        date: { gte: start, lte: end },
      },
    }),
  ]);

  return { workers, attendances, productionLogs, dispatchLogs, start, end };
}

function toWorkerInput(w: {
  id: string;
  name: string;
  wageType: string;
  dailyWage: unknown;
  perBrickRate: unknown;
  monthlySalary: unknown;
  perTruckRate: unknown;
  standardHoursPerDay: unknown;
  bricksTargetPerDay: number | null;
  advanceBalance: unknown;
  category: { wageType: string } | null;
}): WorkerPayInput {
  return {
    id: w.id,
    name: w.name,
    wageType: (w.wageType || w.category?.wageType || "DAILY") as WorkerPayInput["wageType"],
    dailyWage: Number(w.dailyWage),
    perBrickRate: Number(w.perBrickRate),
    monthlySalary: Number(w.monthlySalary),
    perTruckRate: Number(w.perTruckRate),
    standardHoursPerDay: Number(w.standardHoursPerDay) || 8,
    bricksTargetPerDay: w.bricksTargetPerDay,
    advanceBalance: Number(w.advanceBalance),
  };
}

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    const sp = req.nextUrl.searchParams;
    const month = Number(sp.get("month") ?? new Date().getMonth() + 1);
    const year = Number(sp.get("year") ?? new Date().getFullYear());
    const workerId = sp.get("workerId");

    if (month < 1 || month > 12) return apiError("Invalid month");

    const workerIds = workerId ? [workerId] : [];
    const { workers, attendances, productionLogs, dispatchLogs } = await loadMonthData(
      workerIds,
      month,
      year
    );

    const calculations = workers.map((w) => {
      const wAtt = attendances.filter((a) => a.workerId === w.id);
      const prodBricks = productionLogs
        .filter((p) => p.workerId === w.id)
        .reduce((s, p) => s + p.bricksProduced, 0);
      const trips = dispatchLogs
        .filter((d) => d.workerId === w.id)
        .reduce((s, d) => s + d.tripCount, 0);

      return calculateWorkerPayroll(
        toWorkerInput(w),
        wAtt.map(
          (a): AttendanceRow => ({
            status: a.status,
            regularHours: a.regularHours,
            extraHours: a.extraHours,
            overtime: a.overtime,
            bricksProduced: a.bricksProduced,
            workReport: a.workReport as Record<string, unknown> | null,
          })
        ),
        prodBricks,
        trips,
        month,
        year
      );
    });

    const totals = calculations.reduce(
      (acc, c) => ({
        gross: acc.gross + c.grossPay,
        net: acc.net + c.netPay,
        deductions: acc.deductions + c.deductions,
      }),
      { gross: 0, net: 0, deductions: 0 }
    );

    return apiSuccess({
      month,
      year,
      calculations,
      totals,
      workerCount: calculations.length,
    });
  }, "ACCOUNTANT");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const parsed = payrollAutoSchema.safeParse(await req.json());
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");

    const { month, year, workerIds, deductAdvance, skipPaid, skipEmpty } = parsed.data;

    const { workers, attendances, productionLogs, dispatchLogs } = await loadMonthData(
      workerIds ?? [],
      month,
      year
    );

    const existing = await prisma.payroll.findMany({
      where: { month, year, workerId: { in: workers.map((w) => w.id) } },
    });
    const existingMap = new Map(existing.map((p) => [p.workerId, p]));

    const results: { workerId: string; action: string; netPay: number }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const w of workers) {
        const prev = existingMap.get(w.id);
        if (skipPaid && prev?.isPaid) {
          results.push({ workerId: w.id, action: "skipped_paid", netPay: Number(prev.netPay) });
          continue;
        }

        const wAtt = attendances.filter((a) => a.workerId === w.id);
        const prodBricks = productionLogs
          .filter((p) => p.workerId === w.id)
          .reduce((s, p) => s + p.bricksProduced, 0);
        const trips = dispatchLogs
          .filter((d) => d.workerId === w.id)
          .reduce((s, d) => s + d.tripCount, 0);

        const calc = calculateWorkerPayroll(
          toWorkerInput(w),
          wAtt.map(
            (a): AttendanceRow => ({
              status: a.status,
              regularHours: a.regularHours,
              extraHours: a.extraHours,
              overtime: a.overtime,
              bricksProduced: a.bricksProduced,
              workReport: a.workReport as Record<string, unknown> | null,
            })
          ),
          prodBricks,
          trips,
          month,
          year,
          { deductAdvance }
        );

        if (skipEmpty && calc.skipped) {
          results.push({ workerId: w.id, action: "skipped_empty", netPay: 0 });
          continue;
        }

        await tx.payroll.upsert({
          where: {
            workerId_month_year: { workerId: w.id, month, year },
          },
          create: {
            workerId: w.id,
            month,
            year,
            baseSalary: calc.baseSalary,
            brickBonus: calc.brickBonus,
            overtimePay: calc.overtimePay,
            deductions: calc.deductions,
            netPay: calc.netPay,
            isPaid: false,
          },
          update: {
            baseSalary: calc.baseSalary,
            brickBonus: calc.brickBonus,
            overtimePay: calc.overtimePay,
            deductions: calc.deductions,
            netPay: calc.netPay,
            ...(prev?.isPaid ? {} : { isPaid: false }),
          },
        });

        results.push({ workerId: w.id, action: prev ? "updated" : "created", netPay: calc.netPay });
      }
    });

    const calculations = workers.map((w) => {
      const wAtt = attendances.filter((a) => a.workerId === w.id);
      const prodBricks = productionLogs
        .filter((p) => p.workerId === w.id)
        .reduce((s, p) => s + p.bricksProduced, 0);
      const trips = dispatchLogs
        .filter((d) => d.workerId === w.id)
        .reduce((s, d) => s + d.tripCount, 0);
      return calculateWorkerPayroll(
        toWorkerInput(w),
        wAtt.map(
          (a): AttendanceRow => ({
            status: a.status,
            regularHours: a.regularHours,
            extraHours: a.extraHours,
            overtime: a.overtime,
            bricksProduced: a.bricksProduced,
            workReport: a.workReport as Record<string, unknown> | null,
          })
        ),
        prodBricks,
        trips,
        month,
        year,
        { deductAdvance }
      );
    });

    return apiSuccess({
      month,
      year,
      results,
      calculations,
      generated: results.filter((r) => r.action === "created" || r.action === "updated").length,
    });
  }, "ACCOUNTANT");
}
