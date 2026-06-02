import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET() {
  return withAuth(async (user) => {
    if (!user.workerId) {
      return apiError("No worker profile is linked to this account", 404);
    }

    try {
      const worker = await prisma.worker.findUnique({
        where: { id: user.workerId },
        include: {
          attendances: { orderBy: { date: "desc" }, take: 14 },
          payrolls: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 },
        },
      });
      if (!worker) return apiError("Worker profile not found", 404);
      return apiSuccess(worker);
    } catch {
      return apiError("Database not available. Run: npm run db:setup", 503);
    }
  }, "WORKER");
}
