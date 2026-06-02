import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth, logAudit } from "@/lib/api-utils";
import { parseListQuery, paginateMeta } from "@/lib/query-params";
import { customerSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const q = parseListQuery(req);
      const where: Prisma.CustomerWhereInput = {};
      if (q.search) {
        where.OR = [
          { name: { contains: q.search, mode: "insensitive" } },
          { phone: { contains: q.search } },
          { companyName: { contains: q.search, mode: "insensitive" } },
          { city: { contains: q.search, mode: "insensitive" } },
          { contactPerson: { contains: q.search, mode: "insensitive" } },
        ];
      }
      if (
        q.status &&
        ["BUILDER", "CONTRACTOR", "RETAILER", "WHOLESALER", "GOVERNMENT", "OTHER"].includes(q.status)
      ) {
        where.customerType = q.status as Prisma.CustomerWhereInput["customerType"];
      }

      const [customers, total, orders, pendingDues] = await Promise.all([
        prisma.customer.findMany({
          where,
          include: { _count: { select: { orders: true } } },
          orderBy: { name: "asc" },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
        }),
        prisma.customer.count({ where }),
        prisma.order.findMany({
          include: { customer: { select: { name: true, phone: true } } },
          orderBy: { orderDate: "desc" },
          take: 25,
        }),
        prisma.customer.aggregate({ _sum: { balance: true } }),
      ]);

      return apiSuccess({
        customers,
        orders,
        pendingDues: Number(pendingDues._sum.balance || 0),
        meta: paginateMeta(total, q.page, q.limit),
      });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "MANAGER");
}

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const parsed = customerSchema.safeParse(await req.json());
      if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Validation failed");

      const customer = await prisma.customer.create({
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          cnic: parsed.data.cnic || null,
          companyName: parsed.data.companyName,
          customerType: parsed.data.customerType ?? "BUILDER",
          contactPerson: parsed.data.contactPerson,
          email: parsed.data.email || null,
          address: parsed.data.address,
          city: parsed.data.city,
          notes: parsed.data.notes,
          balance: parsed.data.balance ?? 0,
          creditLimit: parsed.data.creditLimit ?? 0,
          salesAgentId: parsed.data.salesAgentId || null,
        },
      });
      await logAudit(user.id, "CREATE", "Customer", customer.id);
      return apiSuccess(customer, 201);
    } catch {
      return apiError("Create failed", 400);
    }
  }, "MANAGER");
}
