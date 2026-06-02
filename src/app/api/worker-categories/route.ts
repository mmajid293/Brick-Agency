import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const departmentCode = new URL(req.url).searchParams.get("department");
      const where: { isActive: boolean; department?: { code: string } } = {
        isActive: true,
      };
      if (departmentCode) {
        where.department = { code: departmentCode };
      }

      const categories = await prisma.workerCategory.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        include: {
          department: true,
          _count: { select: { workers: true } },
        },
      });
      return apiSuccess(categories);
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  });
}
