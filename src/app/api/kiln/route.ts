import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET() {
  return withAuth(async () => {
    try {
      const logs = await prisma.kilnLog.findMany({
        orderBy: { recordedAt: "desc" },
        take: 20,
      });
      const weather = await prisma.weatherLog.findFirst({
        orderBy: { recordedAt: "desc" },
      });
      return apiSuccess({ logs, weather });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}
