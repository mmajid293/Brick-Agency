import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { checkInSchema } from "@/lib/validations";
import { startOfDay } from "date-fns";

function parseCheckTime(date: Date, timeStr?: string, useManual?: boolean) {
  if (useManual && timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }
  return new Date();
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = checkInSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const day = startOfDay(parsed.data.date ? new Date(parsed.data.date) : new Date());
      const worker = await prisma.worker.findUnique({
        where: { id: parsed.data.workerId },
        select: { standardHoursPerDay: true },
      });
      if (!worker) return apiError("Worker not found", 404);

      const checkIn = parseCheckTime(day, parsed.data.checkIn, parsed.data.useManualTime);

      const record = await prisma.attendance.upsert({
        where: { workerId_date: { workerId: parsed.data.workerId, date: day } },
        create: {
          workerId: parsed.data.workerId,
          date: day,
          status: "PRESENT",
          checkIn,
          regularHours: worker.standardHoursPerDay,
          qrScanned: false,
        },
        update: {
          status: "PRESENT",
          checkIn,
          checkOut: null,
        },
      });

      return apiSuccess(record, 201);
    } catch {
      return apiError("Check-in failed", 400);
    }
  }, "SUPERVISOR");
}
