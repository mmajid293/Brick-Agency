import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { vehicleSchema } from "@/lib/validations";

export async function GET() {
  return withAuth(async () => {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { registration: "asc" },
      include: { driverWorker: { select: { id: true, name: true } } },
    });
    return apiSuccess(vehicles);
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const parsed = vehicleSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");
    const vehicle = await prisma.vehicle.create({
      data: {
        ...parsed.data,
        driverPhone: parsed.data.driverPhone || null,
        driverWorkerId: parsed.data.driverWorkerId || null,
      },
    });
    return apiSuccess(vehicle, 201);
  }, "MANAGER");
}
