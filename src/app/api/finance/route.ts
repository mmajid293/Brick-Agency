import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { transactionSchema, expenseSchema } from "@/lib/validations";

export async function GET() {
  return withAuth(async () => {
    try {
      const [transactions, expenses] = await Promise.all([
        prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 80 }),
        prisma.expense.findMany({ orderBy: { date: "desc" }, take: 40 }),
      ]);
      const income = transactions
        .filter((t) => t.type === "INCOME" || t.type === "CUSTOMER_PAYMENT")
        .reduce((s, t) => s + Number(t.amount), 0);
      const expenseTotal =
        expenses.reduce((s, e) => s + Number(e.amount), 0) +
        transactions
          .filter((t) => ["EXPENSE", "SALARY", "SUPPLIER_PAYMENT", "ADVANCE"].includes(t.type))
          .reduce((s, t) => s + Number(t.amount), 0);
      return apiSuccess({
        transactions,
        expenses,
        summary: { income, expenseTotal, net: income - expenseTotal },
      });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "ACCOUNTANT");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const body = await req.json();
      if (body.kind === "expense") {
        const parsed = expenseSchema.safeParse(body);
        if (!parsed.success) return apiError("Validation failed");
        const expense = await prisma.expense.create({
          data: {
            ...parsed.data,
            date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
          },
        });
        return apiSuccess(expense, 201);
      }

      const parsed = transactionSchema.safeParse(body);
      if (!parsed.success) return apiError("Validation failed");

      const transaction = await prisma.transaction.create({
        data: {
          ...parsed.data,
          date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        },
      });

      if (parsed.data.type === "CUSTOMER_PAYMENT" && parsed.data.customerId) {
        await prisma.customer.update({
          where: { id: parsed.data.customerId },
          data: { balance: { decrement: parsed.data.amount } },
        });
      }

      return apiSuccess(transaction, 201);
    } catch {
      return apiError("Failed to save", 400);
    }
  }, "ACCOUNTANT");
}
