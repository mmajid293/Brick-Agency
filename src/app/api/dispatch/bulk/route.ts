import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { bulkDispatchSchema } from "@/lib/validations";
import { generateChallanNumbers } from "@/lib/challan-number";
import { deductInventoryForDispatch } from "@/lib/inventory-sync";

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = bulkDispatchSchema.safeParse(await req.json());
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
      }

      const order = await prisma.order.findUnique({
        where: { id: parsed.data.orderId },
        include: { dispatches: true },
      });
      if (!order) return apiError("Order not found", 404);

      const already = order.dispatches.reduce((s, d) => s + d.bricksLoaded, 0);
      const totalNew = parsed.data.trucks.reduce((s, t) => s + t.bricksLoaded, 0);
      const remaining = order.quantity - already;
      if (totalNew > remaining) {
        return apiError(
          `Total bricks (${totalNew}) exceeds remaining order (${remaining})`,
          400
        );
      }

      const needChallans = parsed.data.trucks.filter((t) => !t.challanNo).length;
      const autoChallans = await generateChallanNumbers(needChallans);
      let challanIdx = 0;

      const created = await prisma.$transaction(async (tx) => {
        const rows = [];
        for (const truck of parsed.data.trucks) {
          const challanNo =
            truck.challanNo?.trim() ||
            autoChallans[challanIdx++] ||
            (await generateChallanNumbers(1))[0];

          const d = await tx.dispatch.create({
            data: {
              orderId: parsed.data.orderId,
              vehicleId: truck.vehicleId || null,
              truckNumber: truck.truckNumber,
              driverName: truck.driverName,
              driverPhone: truck.driverPhone || null,
              bricksLoaded: truck.bricksLoaded,
              challanNo,
              biltyNo: truck.biltyNo || null,
              transporterName: truck.transporterName || null,
              freightAmount: truck.freightAmount ?? 0,
              deliveryStatus: "IN_TRANSIT",
              notes: parsed.data.notes,
            },
          });
          rows.push(d);

          if (truck.vehicleId) {
            await tx.vehicle.update({
              where: { id: truck.vehicleId },
              data: {
                driverName: truck.driverName,
                driverPhone: truck.driverPhone || undefined,
              },
            });
          }
        }

        const newTotal = already + totalNew;
        const newStatus =
          newTotal >= order.quantity
            ? "DISPATCHED"
            : newTotal > 0
              ? "CONFIRMED"
              : order.status;

        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus },
        });

        await deductInventoryForDispatch(
          tx,
          order.brickGrade,
          totalNew,
          `Dispatch ${rows.map((r) => r.challanNo).join(", ")}`
        );

        return rows;
      });

      return apiSuccess({ dispatches: created, count: created.length }, 201);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return apiError("Challan number already exists", 400);
      }
      return apiError("Dispatch failed", 400);
    }
  }, "MANAGER");
}
