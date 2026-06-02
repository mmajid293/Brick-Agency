import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { kilnSchema, kilnBatchSchema } from "@/lib/validations";
import { startOfDay } from "date-fns";

export async function GET() {
  return withAuth(async () => {
    const kilns = await prisma.kiln.findMany({
      orderBy: { code: "asc" },
      include: {
        batches: { orderBy: { batchNumber: "desc" }, take: 5 },
        _count: { select: { batches: true } },
      },
    });
    return apiSuccess(kilns);
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const body = await req.json();
    if (body.action === "batch") {
      const parsed = kilnBatchSchema.safeParse(body);
      if (!parsed.success) return apiError("Validation failed");
      let batchNumber = parsed.data.batchNumber;
      if (!batchNumber) {
        const last = await prisma.kilnBatch.findFirst({
          where: { kilnId: parsed.data.kilnId },
          orderBy: { batchNumber: "desc" },
        });
        batchNumber = (last?.batchNumber ?? 0) + 1;
      }
      const batch = await prisma.kilnBatch.create({
        data: {
          kilnId: parsed.data.kilnId,
          batchNumber,
          status: parsed.data.status ?? "LOADING",
          loadDate: startOfDay(new Date(parsed.data.loadDate)),
          bricksIn: parsed.data.bricksIn ?? 0,
          bricksOutA: parsed.data.bricksOutA ?? 0,
          bricksOutB: parsed.data.bricksOutB ?? 0,
          broken: parsed.data.broken ?? 0,
          temperature: parsed.data.temperature,
          fuelUsed: parsed.data.fuelUsed,
          fuelType: parsed.data.fuelType,
          notes: parsed.data.notes,
        },
      });
      return apiSuccess(batch, 201);
    }

    const parsed = kilnSchema.safeParse(body);
    if (!parsed.success) return apiError("Validation failed");
    const kiln = await prisma.kiln.create({ data: parsed.data });
    return apiSuccess(kiln, 201);
  }, "MANAGER");
}
