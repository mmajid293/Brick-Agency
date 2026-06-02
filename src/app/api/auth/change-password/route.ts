import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const parsed = changePasswordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return apiError("User not found", 404);

      const ok = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
      if (!ok) return apiError("Current password is incorrect", 401);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(parsed.data.newPassword) },
      });

      return apiSuccess({ message: "Password updated" });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "WORKER");
}
