import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { payrollSchema } from "@/lib/validations";

export async function GET() {
  return withAuth(async () => {
    try {
      const payrolls = await prisma.payroll.findMany({
        include: { worker: { select: { name: true, nameUrdu: true, department: true, workerCode: true } } },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 80,
      });
      const workers = await prisma.worker.findMany({
        where: { isActive: true },
        select: { id: true, name: true, dailyWage: true, advanceBalance: true, department: true, workerCode: true },
      });
      const totalPending = payrolls.filter((p) => !p.isPaid).reduce((s, p) => s + Number(p.netPay), 0);
      return apiSuccess({ payrolls, workers, totalPending });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "ACCOUNTANT");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = payrollSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const netPay =
        parsed.data.baseSalary +
        (parsed.data.brickBonus ?? 0) +
        (parsed.data.overtimePay ?? 0) -
        (parsed.data.deductions ?? 0);

      const payroll = await prisma.payroll.upsert({
        where: {
          workerId_month_year: {
            workerId: parsed.data.workerId,
            month: parsed.data.month,
            year: parsed.data.year,
          },
        },
        create: { ...parsed.data, netPay },
        update: { ...parsed.data, netPay, isPaid: parsed.data.isPaid },
      });

      if (parsed.data.isPaid) {
        await prisma.transaction.create({
          data: {
            type: "SALARY",
            amount: netPay,
            description: `Payroll ${parsed.data.month}/${parsed.data.year}`,
            workerId: parsed.data.workerId,
            category: "Salary",
          },
        });
      }

      return apiSuccess(payroll, 201);
    } catch {
      return apiError("Payroll save failed", 400);
    }
  }, "ACCOUNTANT");
}
