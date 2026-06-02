import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { checkOutSchema } from "@/lib/validations";
import { hoursFromCheckTimes, primaryQuantityFromReport } from "@/lib/work-report";
import { startOfDay } from "date-fns";

export async function POST(req: Request) {
  return withAuth(async (user) => {
    if (!user.workerId) return apiError("No worker profile linked", 404);

    try {
      const body = await req.json();
      const parsed = checkOutSchema.safeParse({ ...body, workerId: user.workerId });
      if (!parsed.success) return apiError("Validation failed");

      const day = startOfDay(new Date());
      const worker = await prisma.worker.findUnique({
        where: { id: user.workerId },
        select: { standardHoursPerDay: true, jobRole: true },
      });
      if (!worker) return apiError("Worker not found", 404);

      const existing = await prisma.attendance.findUnique({
        where: { workerId_date: { workerId: user.workerId, date: day } },
      });

      const checkIn = existing?.checkIn ?? new Date(day.getTime() + 6 * 3600000);
      const checkOut = parsed.data.useManualTime && parsed.data.checkOut
        ? (() => {
            const [h, m] = parsed.data.checkOut.split(":").map(Number);
            const d = new Date(day);
            d.setHours(h || 0, m || 0, 0, 0);
            return d;
          })()
        : new Date();

      const standard = Number(worker.standardHoursPerDay ?? 8);
      const { regularHours, extraHours } = hoursFromCheckTimes(checkIn, checkOut, standard);
      const workReport = parsed.data.workReport ?? {};
      const bricks = primaryQuantityFromReport(worker.jobRole, workReport);

      const record = await prisma.attendance.upsert({
        where: { workerId_date: { workerId: user.workerId, date: day } },
        create: {
          workerId: user.workerId,
          date: day,
          status: extraHours > 0 ? "OVERTIME" : "PRESENT",
          checkIn,
          checkOut,
          regularHours,
          extraHours,
          overtime: extraHours,
          bricksProduced: bricks,
          workReport,
          taskCompleted: parsed.data.taskCompleted,
          notes: parsed.data.notes,
          qrScanned: true,
        },
        update: {
          checkOut,
          regularHours,
          extraHours,
          overtime: extraHours,
          bricksProduced: bricks,
          workReport,
          taskCompleted: parsed.data.taskCompleted,
          notes: parsed.data.notes,
        },
      });

      return apiSuccess({ message: "Checked out", record });
    } catch {
      return apiError("Check-out failed", 400);
    }
  }, "WORKER");
}
