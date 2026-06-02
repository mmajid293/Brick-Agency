import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth, logAudit } from "@/lib/api-utils";
import { customerSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async () => {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { orderDate: "desc" } },
        payments: { orderBy: { date: "desc" }, take: 30 },
      },
    });
    if (!customer) return apiError("Not found", 404);
    return apiSuccess(customer);
  }, "MANAGER");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const parsed = customerSchema.partial().safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...parsed.data,
        cnic: parsed.data.cnic === "" ? null : parsed.data.cnic,
        email: parsed.data.email === "" ? null : parsed.data.email,
      },
    });
    await logAudit(user.id, "UPDATE", "Customer", id);
    return apiSuccess(customer);
  }, "MANAGER");
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const orderCount = await prisma.order.count({ where: { customerId: id } });
    if (orderCount > 0) return apiError("Customer has orders — cannot delete", 400);
    await prisma.customer.delete({ where: { id } });
    await logAudit(user.id, "DELETE", "Customer", id);
    return apiSuccess({ deleted: true });
  }, "MANAGER");
}
