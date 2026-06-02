import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { invoiceSchema } from "@/lib/validations";

async function nextInvoiceNumber() {
  const n = await prisma.invoice.count();
  return `INV-${new Date().getFullYear()}-${String(n + 1).padStart(4, "0")}`;
}

export async function GET() {
  return withAuth(async () => {
    const invoices = await prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        order: {
          include: { customer: { select: { id: true, name: true, phone: true } } },
        },
      },
      take: 100,
    });
    return apiSuccess(invoices);
  }, "ACCOUNTANT");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const parsed = invoiceSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");

    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order) return apiError("Order not found", 404);

    const existing = await prisma.invoice.findUnique({ where: { orderId: order.id } });
    if (existing) return apiError("Invoice already exists for this order", 400);

    const tax = parsed.data.taxAmount ?? 0;
    const amount = Number(order.totalAmount) + tax;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await nextInvoiceNumber(),
        orderId: order.id,
        amount,
        taxAmount: tax,
        ntn: parsed.data.ntn,
        notes: parsed.data.notes,
      },
    });
    return apiSuccess(invoice, 201);
  }, "ACCOUNTANT");
}
