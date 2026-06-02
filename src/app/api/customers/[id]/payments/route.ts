import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const paymentSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: customerId } = await ctx.params;
  return withAuth(async () => {
    try {
      const parsed = paymentSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) return apiError("Customer not found", 404);

      const payment = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            type: "CUSTOMER_PAYMENT",
            amount: parsed.data.amount,
            description: parsed.data.description ?? `Payment from ${customer.name}`,
            customerId,
            reference: parsed.data.reference,
            category: "Sales",
          },
        });
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: { decrement: parsed.data.amount } },
        });
        return transaction;
      });

      return apiSuccess(payment, 201);
    } catch {
      return apiError("Payment failed", 400);
    }
  }, "ACCOUNTANT");
}
