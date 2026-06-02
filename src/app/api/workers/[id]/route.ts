import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth, logAudit } from "@/lib/api-utils";
import { workerSchema } from "@/lib/validations";
import { resolveWorkerClassification } from "@/lib/worker-resolve";

type Ctx = { params: Promise<{ id: string }> };

const workerInclude = {
  category: { include: { department: true } },
  departmentRef: true,
  supervisor: { select: { id: true, name: true, workerCode: true } },
  advances: { orderBy: { date: "desc" as const }, take: 20 },
  attendances: { orderBy: { date: "desc" as const }, take: 30 },
  payrolls: { orderBy: [{ year: "desc" as const }, { month: "desc" as const }], take: 12 },
  transactions: { orderBy: { date: "desc" as const }, take: 20 },
  productionLogs: { orderBy: { date: "desc" as const }, take: 14 },
  dispatchLogs: { orderBy: { date: "desc" as const }, take: 14 },
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    if (user.role === "WORKER" && user.workerId !== id) {
      return apiError("Forbidden", 403);
    }
    try {
      const worker = await prisma.worker.findUnique({
        where: { id },
        include: workerInclude,
      });
      if (!worker) return apiError("Worker not found", 404);
      return apiSuccess(worker);
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    try {
      const body = await req.json();
      const parsed = workerSchema.partial().safeParse(body);
      if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Validation failed");

      const existing = await prisma.worker.findUnique({ where: { id } });
      if (!existing) return apiError("Worker not found", 404);

      const merged = {
        name: existing.name,
        cnic: existing.cnic,
        phone: existing.phone,
        address: existing.address,
        dailyWage: Number(existing.dailyWage),
        perBrickRate: Number(existing.perBrickRate),
        monthlySalary: Number(existing.monthlySalary),
        perTruckRate: Number(existing.perTruckRate),
        jobRole: existing.jobRole,
        standardHoursPerDay: Number(existing.standardHoursPerDay),
        ...parsed.data,
      };

      const cls = await resolveWorkerClassification(prisma, merged);

      const worker = await prisma.worker.update({
        where: { id },
        data: {
          ...parsed.data,
          dailyWage: cls.dailyWage,
          perBrickRate: cls.perBrickRate,
          monthlySalary: cls.monthlySalary,
          perTruckRate: cls.perTruckRate,
          department: cls.department,
          departmentId: cls.departmentId,
          categoryId: cls.categoryId,
          jobRole: cls.jobRole,
          wageType: cls.wageType,
          shiftType: cls.shiftType ?? undefined,
          skillLevel: cls.skillLevel,
          dailyTarget: cls.dailyTarget,
          productionAssignment: parsed.data.productionAssignment,
          supervisorId:
            parsed.data.supervisorId === null
              ? null
              : parsed.data.supervisorId ?? undefined,
          joinDate: parsed.data.joinDate ? new Date(parsed.data.joinDate) : undefined,
          imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
          bricksTargetPerDay:
            parsed.data.bricksTargetPerDay === null ? null : cls.bricksTargetPerDay,
        },
        include: {
          category: { include: { department: true } },
          departmentRef: true,
          supervisor: { select: { id: true, name: true, workerCode: true } },
        },
      });
      await logAudit(user.id, "UPDATE", "Worker", id);
      return apiSuccess(worker);
    } catch {
      return apiError("Update failed", 400);
    }
  }, "MANAGER");
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    try {
      await prisma.worker.delete({ where: { id } });
      await logAudit(user.id, "DELETE", "Worker", id);
      return apiSuccess({ deleted: true });
    } catch {
      return apiError("Delete failed", 400);
    }
  }, "MANAGER");
}
