import type { BrickGrade, CustomerType } from "@prisma/client";
import { prisma } from "./prisma";

export async function getActiveRate(
  brickGrade: BrickGrade,
  customerType?: CustomerType | null
): Promise<number | null> {
  const today = new Date();
  const card = await prisma.brickRateCard.findFirst({
    where: {
      brickGrade,
      isActive: true,
      effectiveFrom: { lte: today },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      AND: [
        {
          OR: [{ customerType: null }, { customerType: customerType ?? undefined }],
        },
      ],
    },
    orderBy: [{ customerType: "desc" }, { effectiveFrom: "desc" }],
  });
  return card ? Number(card.ratePerBrick) : null;
}

export function calcCommission(totalAmount: number, commissionPct: number) {
  return Math.round((totalAmount * commissionPct) / 100);
}

export async function checkCreditLimit(customerId: string, additionalAmount: number) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return { ok: false, message: "Customer not found" };
  const limit = Number(customer.creditLimit);
  if (limit <= 0) return { ok: true };
  const projected = Number(customer.balance) + additionalAmount;
  if (projected > limit) {
    return {
      ok: false,
      message: `Credit limit exceeded (limit ${limit}, projected balance ${projected})`,
    };
  }
  return { ok: true };
}
