import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { dispatchSchema } from "@/lib/validations";
import { nextChallanNumber } from "@/lib/challan-number";

export async function GET() {
  return withAuth(async () => {
    try {
      const dispatches = await prisma.dispatch.findMany({
        include: {
          order: {
            include: {
              customer: { select: { name: true, city: true, phone: true, companyName: true } },
            },
          },
          vehicle: { select: { registration: true, label: true } },
        },
        orderBy: { dispatchDate: "desc" },
        take: 80,
      });
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = dispatches.filter(
        (d) => new Date(d.dispatchDate) >= todayStart
      ).length;
      return apiSuccess({ dispatches, todayCount });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = dispatchSchema.safeParse(await req.json());
      if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");

      const challanNo = parsed.data.challanNo?.trim() || (await nextChallanNumber());

      const order = await prisma.order.findUnique({
        where: { id: parsed.data.orderId },
        include: { dispatches: true },
      });
      if (!order) return apiError("Order not found", 404);

      const already = order.dispatches.reduce((s, d) => s + d.bricksLoaded, 0);
      if (parsed.data.bricksLoaded > order.quantity - already) {
        return apiError("Bricks exceed remaining order quantity", 400);
      }

      const dispatch = await prisma.$transaction(async (tx) => {
        const d = await tx.dispatch.create({
          data: {
            orderId: parsed.data.orderId,
            vehicleId: parsed.data.vehicleId || null,
            truckNumber: parsed.data.truckNumber,
            driverName: parsed.data.driverName,
            driverPhone: parsed.data.driverPhone || null,
            bricksLoaded: parsed.data.bricksLoaded,
            challanNo,
            notes: parsed.data.notes,
          },
        });
        const newTotal = already + parsed.data.bricksLoaded;
        await tx.order.update({
          where: { id: parsed.data.orderId },
          data: {
            status: newTotal >= order.quantity ? "DISPATCHED" : "CONFIRMED",
          },
        });
        const inv = await tx.brickInventory.findUnique({ where: { grade: order.brickGrade } });
        if (inv && inv.quantity >= parsed.data.bricksLoaded) {
          await tx.brickInventory.update({
            where: { grade: order.brickGrade },
            data: { quantity: inv.quantity - parsed.data.bricksLoaded },
          });
        }
        return d;
      });

      return apiSuccess(dispatch, 201);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return apiError("Challan number already exists", 400);
      }
      return apiError("Dispatch failed", 400);
    }
  }, "MANAGER");
}
