import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { productionSchema, kilnLogSchema } from "@/lib/validations";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const sp = req.nextUrl.searchParams;
      const from = sp.get("from");
      const to = sp.get("to");
      const dateWhere =
        from || to
          ? {
              ...(from ? { gte: startOfDay(new Date(from)) } : {}),
              ...(to ? { lte: endOfDay(new Date(to)) } : {}),
            }
          : undefined;

      const [records, kilnLogs] = await Promise.all([
        prisma.production.findMany({
          where: dateWhere ? { date: dateWhere } : undefined,
          orderBy: { date: "desc" },
          take: 90,
        }),
        prisma.kilnLog.findMany({ orderBy: { recordedAt: "desc" }, take: 20 }),
      ]);
      const today = records.find((r) => r.date.getTime() === startOfDay(new Date()).getTime());
      const totals = records.reduce(
        (a, r) => ({
          raw: a.raw + r.rawProduced,
          cooked: a.cooked + r.cookedProduced,
          gradeA: a.gradeA + r.gradeA,
          wastage: a.wastage + r.wastage,
        }),
        { raw: 0, cooked: 0, gradeA: 0, wastage: 0 }
      );
      return apiSuccess({ records, today, totals, kilnLogs });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const body = await req.json();
      if (body.action === "kiln") {
        const parsed = kilnLogSchema.safeParse(body);
        if (!parsed.success) return apiError("Validation failed");
        const log = await prisma.kilnLog.create({ data: parsed.data });
        return apiSuccess(log, 201);
      }

      const parsed = productionSchema.safeParse(body);
      if (!parsed.success) return apiError("Validation failed");

      const date = startOfDay(new Date(parsed.data.date));
      const record = await prisma.production.upsert({
        where: { date_kilnCycle: { date, kilnCycle: parsed.data.kilnCycle } },
        create: { ...parsed.data, date, temperature: parsed.data.temperature ?? null },
        update: {
          rawProduced: parsed.data.rawProduced,
          cookedProduced: parsed.data.cookedProduced,
          gradeA: parsed.data.gradeA,
          gradeB: parsed.data.gradeB,
          broken: parsed.data.broken,
          wastage: parsed.data.wastage,
          temperature: parsed.data.temperature ?? null,
          notes: parsed.data.notes,
        },
      });

      await prisma.$transaction(async (tx) => {
        const { applyProductionToInventory } = await import("@/lib/inventory-sync");
        await applyProductionToInventory(tx, {
          rawProduced: parsed.data.rawProduced,
          cookedProduced: parsed.data.cookedProduced,
          gradeA: parsed.data.gradeA,
          gradeB: parsed.data.gradeB,
          broken: parsed.data.broken,
        });
      });

      return apiSuccess(record, 201);
    } catch {
      return apiError("Production entry failed", 400);
    }
  }, "MANAGER");
}
