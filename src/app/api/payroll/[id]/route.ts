import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  isPaid: z.boolean().optional(),
  deductions: z.number().min(0).optional(),
  brickBonus: z.number().min(0).optional(),
  overtimePay: z.number().min(0).optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    try {
      const parsed = patchSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const existing = await prisma.payroll.findUnique({ where: { id } });
      if (!existing) return apiError("Not found", 404);

      const brickBonus = parsed.data.brickBonus ?? Number(existing.brickBonus);
      const overtimePay = parsed.data.overtimePay ?? Number(existing.overtimePay);
      const deductions = parsed.data.deductions ?? Number(existing.deductions);
      const netPay = Number(existing.baseSalary) + brickBonus + overtimePay - deductions;
      const isPaid = parsed.data.isPaid ?? existing.isPaid;

      const payroll = await prisma.payroll.update({
        where: { id },
        data: { brickBonus, overtimePay, deductions, netPay, isPaid, paidAt: isPaid ? new Date() : null },
      });

      if (isPaid && !existing.isPaid) {
        await prisma.transaction.create({
          data: {
            type: "SALARY",
            amount: netPay,
            description: `Payroll ${existing.month}/${existing.year}`,
            workerId: existing.workerId,
            category: "Salary",
          },
        });
        if (deductions > 0) {
          const worker = await prisma.worker.findUnique({
            where: { id: existing.workerId },
            select: { advanceBalance: true },
          });
          if (worker && Number(worker.advanceBalance) > 0) {
            const deduct = Math.min(Number(worker.advanceBalance), deductions);
            await prisma.worker.update({
              where: { id: existing.workerId },
              data: { advanceBalance: { decrement: deduct } },
            });
          }
        }
      }

      return apiSuccess(payroll);
    } catch {
      return apiError("Update failed", 400);
    }
  }, "ACCOUNTANT");
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    try {
      await prisma.payroll.delete({ where: { id } });
      return apiSuccess({ deleted: true });
    } catch {
      return apiError("Delete failed", 400);
    }
  }, "ACCOUNTANT");
}
