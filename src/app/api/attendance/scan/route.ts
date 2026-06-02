import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth, logAudit } from "@/lib/api-utils";
import { startOfDay } from "date-fns";

const schema = z.object({ workerId: z.string().min(1) });

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const body = await req.json();
      const parsed = schema.safeParse(body);
      if (!parsed.success) return apiError("Invalid worker ID");

      const today = startOfDay(new Date());
      const worker = await prisma.worker.findUnique({ where: { id: parsed.data.workerId } });
      if (!worker) return apiError("Worker not found", 404);

      const record = await prisma.attendance.upsert({
        where: { workerId_date: { workerId: worker.id, date: today } },
        update: { status: "PRESENT", qrScanned: true, checkIn: new Date() },
        create: {
          workerId: worker.id,
          date: today,
          status: "PRESENT",
          qrScanned: true,
          checkIn: new Date(),
        },
      });

      await logAudit(user.id, "QR_CHECKIN", "Attendance", record.id, worker.name);
      return apiSuccess({ worker: worker.name, record });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}
