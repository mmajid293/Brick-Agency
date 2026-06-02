import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { advanceSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: workerId } = await ctx.params;
  return withAuth(async () => {
    try {
      const body = await req.json();
      const parsed = advanceSchema.safeParse(body);
      if (!parsed.success) return apiError("Validation failed");

      const advance = await prisma.$transaction(async (tx) => {
        const record = await tx.advance.create({
          data: {
            workerId,
            amount: parsed.data.amount,
            reason: parsed.data.reason,
            date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
          },
        });
        await tx.worker.update({
          where: { id: workerId },
          data: { advanceBalance: { increment: parsed.data.amount } },
        });
        await tx.transaction.create({
          data: {
            type: "ADVANCE",
            amount: parsed.data.amount,
            description: `Advance to worker`,
            workerId,
            category: "Advance",
          },
        });
        return record;
      });

      return apiSuccess(advance, 201);
    } catch {
      return apiError("Failed to record advance", 400);
    }
  }, "MANAGER");
}
