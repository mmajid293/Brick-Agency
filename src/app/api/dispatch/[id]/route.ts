import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { dispatchDeliverySchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    try {
      const dispatch = await prisma.dispatch.findUnique({
        where: { id },
        include: {
          order: {
            include: { customer: true },
          },
        },
      });
      if (!dispatch) return apiError("Not found", 404);
      return apiSuccess(dispatch);
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    const parsed = dispatchDeliverySchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");
    const dispatch = await prisma.dispatch.update({
      where: { id },
      data: {
        ...parsed.data,
        deliveredAt:
          parsed.data.deliveryStatus === "DELIVERED" ? new Date() : undefined,
      },
    });
    if (parsed.data.deliveryStatus === "DELIVERED") {
      const order = await prisma.order.findUnique({ where: { id: dispatch.orderId } });
      if (order && order.status !== "DELIVERED") {
        const all = await prisma.dispatch.findMany({ where: { orderId: order.id } });
        const loaded = all.reduce((s, d) => s + d.bricksLoaded, 0);
        if (loaded >= order.quantity) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "DELIVERED" },
          });
        }
      }
    }
    return apiSuccess(dispatch);
  }, "SUPERVISOR");
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    try {
      await prisma.dispatch.delete({ where: { id } });
      return apiSuccess({ deleted: true });
    } catch {
      return apiError("Delete failed", 400);
    }
  }, "MANAGER");
}
