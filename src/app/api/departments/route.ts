import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET() {
  return withAuth(async () => {
    try {
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { workers: true, categories: true } },
        },
      });
      return apiSuccess(departments);
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  });
}
