import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET() {
  return withAuth(async () => {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      const unread = notifications.filter((n) => !n.isRead).length;
      return apiSuccess({ notifications, unread });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "WORKER");
}
