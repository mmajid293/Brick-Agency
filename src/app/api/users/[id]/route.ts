import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth, logAudit } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (admin) => {
    try {
      const parsed = userUpdateSchema.safeParse(await req.json());
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
      }

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) return apiError("User not found", 404);

      const data = parsed.data;
      if (data.workerId) {
        const linked = await prisma.user.findFirst({
          where: { workerId: data.workerId, NOT: { id } },
        });
        if (linked) return apiError("Worker already linked to another user");
      }

      if (data.role && data.role !== "ADMIN" && existing.id === admin.id) {
        return apiError("You cannot remove your own admin role");
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          nameUrdu: data.nameUrdu === undefined ? undefined : data.nameUrdu,
          role: data.role,
          phone: data.phone === "" ? null : data.phone,
          workerId: data.workerId === undefined ? undefined : data.workerId || null,
          isActive: data.isActive,
          ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          workerId: true,
          isActive: true,
        },
      });

      await logAudit(admin.id, "UPDATE", "User", id, user.email);
      return apiSuccess(user);
    } catch {
      return apiError("Update failed", 400);
    }
  }, "ADMIN");
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (admin) => {
    if (id === admin.id) return apiError("Cannot delete your own account");
    try {
      await prisma.user.delete({ where: { id } });
      await logAudit(admin.id, "DELETE", "User", id);
      return apiSuccess({ deleted: true });
    } catch {
      return apiError("Delete failed", 400);
    }
  }, "ADMIN");
}
