import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { checkOutSchema } from "@/lib/validations";
import { hoursFromCheckTimes, primaryQuantityFromReport } from "@/lib/work-report";
import { startOfDay } from "date-fns";

function parseCheckTime(day: Date, timeStr?: string, useManual?: boolean) {
  if (useManual && timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(day);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }
  return new Date();
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = checkOutSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const day = startOfDay(parsed.data.date ? new Date(parsed.data.date) : new Date());
      const worker = await prisma.worker.findUnique({
        where: { id: parsed.data.workerId },
        select: { standardHoursPerDay: true, jobRole: true },
      });
      if (!worker) return apiError("Worker not found", 404);

      const existing = await prisma.attendance.findUnique({
        where: { workerId_date: { workerId: parsed.data.workerId, date: day } },
      });

      const checkIn = existing?.checkIn ?? new Date(day.getTime() + 6 * 3600000);
      const checkOut = parseCheckTime(day, parsed.data.checkOut, parsed.data.useManualTime);
      if (checkOut <= checkIn) return apiError("Check-out must be after check-in", 400);

      const standard = Number(worker.standardHoursPerDay ?? 8);
      const { regularHours, extraHours } = hoursFromCheckTimes(checkIn, checkOut, standard);
      const workReport = parsed.data.workReport ?? {};
      const bricks =
        primaryQuantityFromReport(worker.jobRole, workReport) ??
        (parsed.data.workReport?.bricksMolded != null
          ? Number(parsed.data.workReport.bricksMolded)
          : null);

      if (bricks != null && bricks > 0) {
        await prisma.workerProductionLog.upsert({
          where: { workerId_date: { workerId: parsed.data.workerId, date: day } },
          create: {
            workerId: parsed.data.workerId,
            date: day,
            bricksProduced: bricks,
          },
          update: { bricksProduced: bricks },
        });
      }

      const tripLoads = Number(workReport.truckLoads ?? workReport.tripCount ?? 0);
      if (tripLoads > 0) {
        const dispatchLog = await prisma.workerDispatchLog.findFirst({
          where: { workerId: parsed.data.workerId, date: day },
        });
        if (dispatchLog) {
          await prisma.workerDispatchLog.update({
            where: { id: dispatchLog.id },
            data: {
              tripCount: tripLoads,
              bricksLoaded: Number(workReport.bricksLoaded ?? dispatchLog.bricksLoaded),
            },
          });
        } else {
          await prisma.workerDispatchLog.create({
            data: {
              workerId: parsed.data.workerId,
              date: day,
              tripCount: tripLoads,
              bricksLoaded: Number(workReport.bricksLoaded ?? 0),
            },
          });
        }
      }

      const record = await prisma.attendance.upsert({
        where: { workerId_date: { workerId: parsed.data.workerId, date: day } },
        create: {
          workerId: parsed.data.workerId,
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
        },
        update: {
          status: extraHours > 0 ? "OVERTIME" : "PRESENT",
          checkIn: existing?.checkIn ?? checkIn,
          checkOut,
          regularHours,
          extraHours,
          overtime: extraHours,
          bricksProduced: bricks,
          workReport,
          taskCompleted: parsed.data.taskCompleted,
          notes: parsed.data.notes ?? undefined,
        },
      });

      return apiSuccess(record);
    } catch {
      return apiError("Check-out failed", 400);
    }
  }, "SUPERVISOR");
}
