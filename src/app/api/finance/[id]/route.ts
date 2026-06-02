import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    try {
      await prisma.transaction.delete({ where: { id } });
      return apiSuccess({ deleted: true });
    } catch {
      try {
        await prisma.expense.delete({ where: { id } });
        return apiSuccess({ deleted: true });
      } catch {
        return apiError("Delete failed", 400);
      }
    }
  }, "ACCOUNTANT");
}
