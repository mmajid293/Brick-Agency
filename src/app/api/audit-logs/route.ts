import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 200);
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
      });
      return apiSuccess(logs);
    } catch {
      return apiError("Database not available", 503);
    }
  }, "MANAGER");
}
