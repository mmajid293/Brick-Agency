import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth, logAudit } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";
import { userCreateSchema } from "@/lib/validations";

export async function GET() {
  return withAuth(async () => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          nameUrdu: true,
          role: true,
          phone: true,
          isActive: true,
          workerId: true,
          createdAt: true,
          worker: { select: { id: true, name: true, workerCode: true } },
        },
      });
      return apiSuccess(users);
    } catch {
      return apiError("Database not available", 503);
    }
  }, "ADMIN");
}

export async function POST(req: NextRequest) {
  return withAuth(async (admin) => {
    try {
      const parsed = userCreateSchema.safeParse(await req.json());
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
      }

      const data = parsed.data;
      if (data.workerId) {
        const linked = await prisma.user.findFirst({
          where: { workerId: data.workerId },
        });
        if (linked) return apiError("This worker is already linked to another user");
      }

      const passwordHash = await hashPassword(data.password);
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          name: data.name,
          nameUrdu: data.nameUrdu || null,
          role: data.role,
          phone: data.phone || null,
          workerId: data.workerId || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          workerId: true,
        },
      });

      await logAudit(admin.id, "CREATE", "User", user.id, user.email);
      return apiSuccess(user, 201);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        return apiError("Email already exists");
      }
      return apiError("Could not create user", 400);
    }
  }, "ADMIN");
}
