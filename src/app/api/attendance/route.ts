import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { attendanceSchema } from "@/lib/validations";
import { parseListQuery } from "@/lib/query-params";
import { startOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const q = parseListQuery(req);
      const date = q.from ? startOfDay(new Date(q.from)) : startOfDay(new Date());

      const records = await prisma.attendance.findMany({
        where: { date },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              nameUrdu: true,
              department: true,
              workerCode: true,
              jobRole: true,
              standardHoursPerDay: true,
              bricksTargetPerDay: true,
              category: { select: { code: true, attendanceMode: true, nameEn: true, nameUr: true } },
            },
          },
        },
        orderBy: { checkIn: "desc" },
      });

      const workers = await prisma.worker.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          department: true,
          workerCode: true,
          jobRole: true,
          standardHoursPerDay: true,
          bricksTargetPerDay: true,
          category: { select: { code: true, attendanceMode: true, wageType: true } },
        },
        orderBy: { name: "asc" },
      });

      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthly = await prisma.attendance.groupBy({
        by: ["workerId", "status"],
        where: { date: { gte: monthStart, lte: monthEnd } },
        _count: true,
      });

      const extraHoursSum = await prisma.attendance.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { extraHours: true },
      });

      const summary = {
        present: records.filter((r) => r.status === "PRESENT").length,
        absent: records.filter((r) => r.status === "ABSENT").length,
        leave: records.filter((r) => r.status === "LEAVE").length,
        halfDay: records.filter((r) => r.status === "HALF_DAY").length,
        overtime: records.filter((r) => r.status === "OVERTIME").length,
        qrScanned: records.filter((r) => r.qrScanned).length,
        total: records.length,
        workersTotal: workers.length,
        extraHoursMonth: Number(extraHoursSum._sum.extraHours ?? 0),
      };

      return apiSuccess({ records, summary, date, workers, monthly });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = attendanceSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const date = startOfDay(parsed.data.date ? new Date(parsed.data.date) : new Date());
      const worker = await prisma.worker.findUnique({
        where: { id: parsed.data.workerId },
        select: { standardHoursPerDay: true },
      });
      const defaultHours = Number(worker?.standardHoursPerDay ?? 8);

      let regularHours = parsed.data.regularHours;
      if (regularHours === undefined) {
        if (parsed.data.status === "HALF_DAY") regularHours = defaultHours / 2;
        else if (parsed.data.status === "PRESENT" || parsed.data.status === "OVERTIME")
          regularHours = defaultHours;
        else regularHours = 0;
      }

      const extraHours = parsed.data.extraHours ?? parsed.data.overtime ?? 0;

      const record = await prisma.attendance.upsert({
        where: { workerId_date: { workerId: parsed.data.workerId, date } },
        create: {
          workerId: parsed.data.workerId,
          date,
          status: parsed.data.status,
          checkIn: parsed.data.checkIn ? new Date(parsed.data.checkIn) : new Date(),
          checkOut: parsed.data.checkOut ? new Date(parsed.data.checkOut) : null,
          regularHours,
          extraHours,
          overtime: extraHours,
          bricksProduced: parsed.data.bricksProduced ?? null,
          notes: parsed.data.notes,
        },
        update: {
          status: parsed.data.status,
          checkOut: parsed.data.checkOut ? new Date(parsed.data.checkOut) : undefined,
          regularHours: parsed.data.regularHours ?? regularHours,
          extraHours: parsed.data.extraHours ?? extraHours,
          overtime: parsed.data.extraHours ?? parsed.data.overtime ?? extraHours,
          bricksProduced:
            parsed.data.bricksProduced === null ? null : parsed.data.bricksProduced,
          notes: parsed.data.notes,
        },
      });
      return apiSuccess(record, 201);
    } catch {
      return apiError("Attendance save failed", 400);
    }
  }, "SUPERVISOR");
}
