import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { generateChallanNumbers } from "@/lib/challan-number";

export async function GET() {
  return withAuth(async () => {
    try {
      const [orders, vehicles, truckDrivers, dispatchAgg] = await Promise.all([
        prisma.order.findMany({
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
                city: true,
                companyName: true,
                contactPerson: true,
                address: true,
              },
            },
            dispatches: { select: { bricksLoaded: true, challanNo: true, dispatchDate: true } },
          },
          orderBy: { orderDate: "desc" },
        }),
        prisma.vehicle.findMany({
          where: { isActive: true },
          orderBy: { registration: "asc" },
        }),
        prisma.worker.findMany({
          where: { isActive: true, category: { code: "TRUCK_DRIVER" } },
          select: {
            id: true,
            name: true,
            phone: true,
            workerCode: true,
          },
          take: 20,
        }),
        prisma.dispatch.groupBy({
          by: ["orderId"],
          _sum: { bricksLoaded: true },
        }),
      ]);

      const dispatchedByOrder = new Map(
        dispatchAgg.map((a) => [a.orderId, a._sum.bricksLoaded ?? 0])
      );

      const pendingOrders = orders
        .map((o) => {
          const dispatched = dispatchedByOrder.get(o.id) ?? 0;
          const fromLines = o.dispatches.reduce((s, d) => s + d.bricksLoaded, 0);
          const totalDispatched = Math.max(dispatched, fromLines);
          const remaining = Math.max(0, o.quantity - totalDispatched);
          return {
            id: o.id,
            orderNumber: o.orderNumber,
            brickGrade: o.brickGrade,
            quantity: o.quantity,
            ratePerBrick: Number(o.ratePerBrick),
            totalAmount: Number(o.totalAmount),
            paidAmount: Number(o.paidAmount),
            paymentStatus: o.paymentStatus,
            status: o.status,
            orderDate: o.orderDate,
            deliveryDate: o.deliveryDate,
            customer: o.customer,
            dispatchedSoFar: totalDispatched,
            remaining,
            dispatchCount: o.dispatches.length,
            recentChallans: o.dispatches.slice(0, 3).map((d) => ({
              challanNo: d.challanNo,
              bricksLoaded: d.bricksLoaded,
              dispatchDate: d.dispatchDate,
            })),
          };
        })
        .filter((o) => o.remaining > 0);

      const challanNumbers = await generateChallanNumbers(10);

      return apiSuccess({
        pendingOrders,
        vehicles: vehicles.map((v) => ({
          id: v.id,
          registration: v.registration,
          label: v.label,
          driverName: v.driverName,
          driverPhone: v.driverPhone,
          capacityBricks: v.capacityBricks,
        })),
        drivers: truckDrivers,
        suggestedChallans: challanNumbers,
      });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}
