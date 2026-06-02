import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { parseListQuery, paginateMeta } from "@/lib/query-params";
import { workerSchema } from "@/lib/validations";
import { generateWorkerCode } from "@/lib/worker-code";
import { resolveWorkerClassification } from "@/lib/worker-resolve";
import { isValidCategoryCode, legacyRoleToCategory, resolveCategoryCode } from "@/lib/worker-categories";
import type { Prisma, WorkerJobRole } from "@prisma/client";

const workerInclude = {
  category: { include: { department: true } },
  departmentRef: true,
  supervisor: { select: { id: true, name: true, workerCode: true } },
} satisfies Prisma.WorkerInclude;

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const q = parseListQuery(req);
      const url = new URL(req.url);
      const categoryCode = url.searchParams.get("category");
      const departmentCode = url.searchParams.get("department");
      const wageType = url.searchParams.get("wageType");
      const shiftType = url.searchParams.get("shift");

      const where: Prisma.WorkerWhereInput = {};

      if (q.search) {
        where.OR = [
          { name: { contains: q.search, mode: "insensitive" } },
          { cnic: { contains: q.search } },
          { phone: { contains: q.search } },
          { workerCode: { contains: q.search, mode: "insensitive" } },
          { fatherName: { contains: q.search, mode: "insensitive" } },
        ];
      }
      if (q.status === "active") where.isActive = true;
      if (q.status === "inactive") where.isActive = false;

      if (categoryCode && isValidCategoryCode(categoryCode)) {
        const cat = await prisma.workerCategory.findUnique({ where: { code: categoryCode } });
        if (cat) {
          where.OR = [
            { categoryId: cat.id },
            ...(cat.legacyJobRole
              ? [{ categoryId: null, jobRole: cat.legacyJobRole }]
              : []),
          ];
        }
      } else if (q.status && q.status !== "active" && q.status !== "inactive") {
        const resolved = resolveCategoryCode(q.status);
        if (resolved) {
          const cat = await prisma.workerCategory.findUnique({ where: { code: resolved } });
          if (cat) {
            where.categoryId = cat.id;
          }
        } else if (
          [
            "MOLDING",
            "KILN_OPERATOR",
            "LOADER",
            "UNLOADER",
            "QUALITY_CHECK",
            "MAINTENANCE",
            "DISPATCH",
            "SECURITY",
            "OFFICE",
            "OTHER",
          ].includes(q.status)
        ) {
          where.jobRole = q.status as WorkerJobRole;
        } else {
          where.department = q.status;
        }
      }

      if (departmentCode) {
        where.departmentRef = { code: departmentCode };
      }
      if (wageType) where.wageType = wageType as Prisma.WorkerWhereInput["wageType"];
      if (shiftType) where.shiftType = shiftType as Prisma.WorkerWhereInput["shiftType"];

      const [workers, total] = await Promise.all([
        prisma.worker.findMany({
          where,
          orderBy: { [q.sort || "name"]: q.order },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
          include: workerInclude,
        }),
        prisma.worker.count({ where }),
      ]);

      return apiSuccess({ items: workers, meta: paginateMeta(total, q.page, q.limit) });
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const body = await req.json();
      const parsed = workerSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Validation failed");

      const cls = await resolveWorkerClassification(prisma, parsed.data);
      const workerCode = await generateWorkerCode();

      const worker = await prisma.worker.create({
        data: {
          workerCode,
          name: parsed.data.name,
          nameUrdu: parsed.data.nameUrdu,
          fatherName: parsed.data.fatherName,
          cnic: parsed.data.cnic,
          phone: parsed.data.phone,
          address: parsed.data.address,
          dailyWage: cls.dailyWage,
          perBrickRate: cls.perBrickRate,
          monthlySalary: cls.monthlySalary,
          perTruckRate: cls.perTruckRate,
          department: cls.department,
          departmentId: cls.departmentId,
          categoryId: cls.categoryId,
          jobRole: cls.jobRole,
          wageType: cls.wageType,
          shiftType: cls.shiftType,
          skillLevel: cls.skillLevel,
          dailyTarget: cls.dailyTarget,
          productionAssignment: parsed.data.productionAssignment,
          supervisorId: parsed.data.supervisorId || null,
          workDescription: parsed.data.workDescription,
          standardHoursPerDay: parsed.data.standardHoursPerDay ?? 8,
          shiftStart: parsed.data.shiftStart,
          bricksTargetPerDay: cls.bricksTargetPerDay,
          imageUrl: parsed.data.imageUrl || null,
          joinDate: parsed.data.joinDate ? new Date(parsed.data.joinDate) : new Date(),
          isActive: parsed.data.isActive ?? true,
        },
        include: workerInclude,
      });

      const { logAudit } = await import("@/lib/api-utils");
      await logAudit(user.id, "CREATE", "Worker", worker.id, worker.name);
      return apiSuccess(worker, 201);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") return apiError("CNIC or worker code already exists");
      if (e instanceof Error && e.message.includes("not seeded")) return apiError(e.message, 503);
      return apiError("Database not available", 503);
    }
  }, "MANAGER");
}
