import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { orderSchema } from "@/lib/validations";
import { parseListQuery, paginateMeta } from "@/lib/query-params";
import { checkCreditLimit, calcCommission } from "@/lib/agency";
import type { Prisma } from "@prisma/client";

async function nextOrderNumber() {
  const count = await prisma.order.count();
  return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    try {
      const q = parseListQuery(req);
      const customerId = req.nextUrl.searchParams.get("customerId");
      const where: Prisma.OrderWhereInput = {};
      if (customerId) where.customerId = customerId;
      if (q.status) where.status = q.status as Prisma.EnumOrderStatusFilter["equals"];

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { customer: { select: { id: true, name: true, phone: true } } },
          orderBy: { orderDate: "desc" },
          skip: (q.page - 1) * q.limit,
          take: q.limit,
        }),
        prisma.order.count({ where }),
      ]);

      return apiSuccess({ orders, meta: paginateMeta(total, q.page, q.limit) });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "MANAGER");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = orderSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const totalAmount = parsed.data.quantity * parsed.data.ratePerBrick;
      const paidAmount = parsed.data.paidAmount ?? 0;
      const balanceDue = totalAmount - paidAmount;

      const credit = await checkCreditLimit(parsed.data.customerId, balanceDue);
      if (!credit.ok) return apiError(credit.message ?? "Credit limit exceeded", 400);

      let commissionAmount = 0;
      let salesAgentId = parsed.data.salesAgentId ?? null;
      if (salesAgentId) {
        const agent = await prisma.salesAgent.findUnique({ where: { id: salesAgentId } });
        if (agent) {
          commissionAmount = calcCommission(totalAmount, Number(agent.commissionPct));
        }
      } else {
        const customer = await prisma.customer.findUnique({
          where: { id: parsed.data.customerId },
          select: { salesAgentId: true },
        });
        if (customer?.salesAgentId) {
          salesAgentId = customer.salesAgentId;
          const agent = await prisma.salesAgent.findUnique({ where: { id: salesAgentId } });
          if (agent) {
            commissionAmount = calcCommission(totalAmount, Number(agent.commissionPct));
          }
        }
      }

      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber: await nextOrderNumber(),
            customerId: parsed.data.customerId,
            salesAgentId,
            brickGrade: parsed.data.brickGrade,
            quantity: parsed.data.quantity,
            ratePerBrick: parsed.data.ratePerBrick,
            totalAmount,
            paidAmount,
            commissionAmount,
            status: parsed.data.status ?? "PENDING",
            paymentStatus: parsed.data.paymentStatus ?? (paidAmount >= totalAmount ? "PAID" : paidAmount > 0 ? "PARTIAL" : "PENDING"),
            deliveryDate: parsed.data.deliveryDate ? new Date(parsed.data.deliveryDate) : null,
          },
        });
        if (salesAgentId && commissionAmount > 0) {
          await tx.agentCommission.create({
            data: {
              agentId: salesAgentId,
              orderId: created.id,
              amount: commissionAmount,
            },
          });
        }
        if (balanceDue > 0) {
          await tx.customer.update({
            where: { id: parsed.data.customerId },
            data: { balance: { increment: balanceDue } },
          });
        }
        if (paidAmount > 0) {
          await tx.transaction.create({
            data: {
              type: "CUSTOMER_PAYMENT",
              amount: paidAmount,
              description: `Payment for ${created.orderNumber}`,
              customerId: parsed.data.customerId,
              reference: created.orderNumber,
            },
          });
        }
        return created;
      });

      return apiSuccess(order, 201);
    } catch {
      return apiError("Order creation failed", 400);
    }
  }, "MANAGER");
}
