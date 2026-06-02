import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
      if (q.length < 2) return apiSuccess({ workers: [], customers: [], orders: [] });

      const [workers, customers, orders] = await Promise.all([
        prisma.worker.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { cnic: { contains: q } },
              { phone: { contains: q } },
              { workerCode: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, workerCode: true, phone: true },
          take: 10,
        }),
        prisma.customer.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { companyName: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, phone: true },
          take: 10,
        }),
        prisma.order.findMany({
          where: {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { customer: { name: { contains: q, mode: "insensitive" } } },
            ],
          },
          select: { id: true, orderNumber: true, customerId: true, customer: { select: { name: true } } },
          take: 10,
        }),
      ]);

      return apiSuccess({ workers, customers, orders });
    } catch {
      return apiError("Search unavailable", 503);
    }
  }, "SUPERVISOR");
}
