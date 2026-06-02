import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import {
  materialUpdateSchema,
  materialRecordSchema,
  supplierSchema,
  purchaseSchema,
} from "@/lib/validations";
import { logMaterialStockChange } from "@/lib/material-stock";
import type { MaterialType } from "@prisma/client";

export async function GET() {
  return withAuth(async () => {
    try {
      const materials = await prisma.rawMaterial.findMany({ orderBy: { type: "asc" } });
      const suppliers = await prisma.supplier.findMany({ take: 50 });
      const purchases = await prisma.purchase.findMany({
        include: { supplier: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 30,
      });
      const stockLogs = await prisma.materialStockLog.findMany({
        orderBy: { recordedAt: "desc" },
        take: 200,
      });

      const lastLogByType = new Map<string, (typeof stockLogs)[0]>();
      for (const log of stockLogs) {
        if (!lastLogByType.has(log.materialType)) {
          lastLogByType.set(log.materialType, log);
        }
      }

      const enriched = materials.map((m) => {
        const lastLog = lastLogByType.get(m.type);
        const typeLogs = stockLogs.filter((l) => l.materialType === m.type).slice(0, 15);
        return {
          ...m,
          quantity: Number(m.quantity),
          minStock: Number(m.minStock),
          previousStock: lastLog ? Number(lastLog.previousQty) : Number(m.quantity),
          lastChange: lastLog
            ? {
                operation: lastLog.operation,
                changeQty: Number(lastLog.changeQty),
                recordedAt: lastLog.recordedAt,
                notes: lastLog.notes,
              }
            : null,
          recentLogs: typeLogs.map((l) => ({
            id: l.id,
            previousQty: Number(l.previousQty),
            newQty: Number(l.newQty),
            changeQty: Number(l.changeQty),
            operation: l.operation,
            notes: l.notes,
            recordedAt: l.recordedAt,
          })),
        };
      });

      const lowStock = enriched.filter((m) => m.quantity <= m.minStock);
      return apiSuccess({ materials: enriched, suppliers, purchases, lowStock, stockLogs });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

async function applyStockChange(
  type: MaterialType,
  operation: string,
  quantity: number,
  notes?: string,
  recordedAt?: Date
) {
  const mat = await prisma.rawMaterial.findUnique({ where: { type } });
  if (!mat) return null;

  const previousQty = Number(mat.quantity);
  let newQty = previousQty;
  if (operation === "add" || operation === "purchase") newQty += quantity;
  else if (operation === "subtract" || operation === "usage") newQty -= quantity;
  else if (operation === "set") newQty = quantity;
  newQty = Math.max(0, newQty);

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.rawMaterial.update({
      where: { type },
      data: {
        quantity: newQty,
        ...(operation === "purchase" ? { lastPurchase: recordedAt ?? new Date() } : {}),
      },
    });
    await logMaterialStockChange(tx as typeof prisma, {
      materialType: type,
      previousQty,
      newQty,
      operation,
      notes,
      recordedAt,
    });
    return u;
  });

  return updated;
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const body = await req.json();
      const action = body.action as string;

      if (action === "supplier") {
        const parsed = supplierSchema.safeParse(body);
        if (!parsed.success) return apiError("Validation failed");
        const supplier = await prisma.supplier.create({ data: parsed.data });
        return apiSuccess(supplier, 201);
      }

      if (action === "purchase") {
        const parsed = purchaseSchema.safeParse(body);
        if (!parsed.success) return apiError("Validation failed");
        const totalCost = parsed.data.quantity * parsed.data.unitPrice;
        const purchase = await prisma.$transaction(async (tx) => {
          const mat = await tx.rawMaterial.findUnique({ where: { type: parsed.data.material } });
          if (!mat) throw new Error("Material not found");
          const previousQty = Number(mat.quantity);
          const newQty = previousQty + parsed.data.quantity;

          const p = await tx.purchase.create({
            data: { ...parsed.data, totalCost },
          });
          await tx.rawMaterial.update({
            where: { type: parsed.data.material },
            data: { quantity: newQty, lastPurchase: new Date() },
          });
          await logMaterialStockChange(tx as typeof prisma, {
            materialType: parsed.data.material,
            previousQty,
            newQty,
            operation: "purchase",
            notes: parsed.data.notes ?? `Purchase from supplier`,
          });
          await tx.transaction.create({
            data: {
              type: "SUPPLIER_PAYMENT",
              amount: totalCost,
              description: `Purchase ${parsed.data.material}`,
              category: "Materials",
            },
          });
          return p;
        });
        return apiSuccess(purchase, 201);
      }

      if (action === "record") {
        const parsed = materialRecordSchema.safeParse(body);
        if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation failed");
        const op =
          parsed.data.operation === "usage"
            ? "usage"
            : parsed.data.operation;
        const updated = await applyStockChange(
          parsed.data.type,
          op,
          parsed.data.quantity,
          parsed.data.notes,
          parsed.data.recordDate ? new Date(parsed.data.recordDate) : undefined
        );
        if (!updated) return apiError("Material not found", 404);
        return apiSuccess(updated);
      }

      const parsed = materialUpdateSchema.safeParse(body);
      if (!parsed.success) return apiError("Validation failed");

      const updated = await applyStockChange(
        parsed.data.type,
        parsed.data.operation,
        parsed.data.quantity,
        parsed.data.notes
      );
      if (!updated) return apiError("Material not found", 404);
      return apiSuccess(updated);
    } catch {
      return apiError("Operation failed", 400);
    }
  }, "MANAGER");
}
