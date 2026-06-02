import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { inventoryUpdateSchema } from "@/lib/validations";
import type { BrickGrade } from "@prisma/client";

export async function GET() {
  return withAuth(async () => {
    try {
      const [inventory, movements] = await Promise.all([
        prisma.brickInventory.findMany({ orderBy: { grade: "asc" } }),
        prisma.inventoryMovement.findMany({ orderBy: { date: "desc" }, take: 30 }),
      ]);
      const total = inventory.reduce((s, i) => s + i.quantity, 0);
      const alerts = inventory.filter((i) => i.quantity < 5000 && i.grade !== "RAW");
      return apiSuccess({ inventory, movements, total, alerts });
    } catch {
      return apiError("Database not available", 503);
    }
  }, "SUPERVISOR");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    try {
      const parsed = inventoryUpdateSchema.safeParse(await req.json());
      if (!parsed.success) return apiError("Validation failed");

      const { grade, quantity, type, fromGrade, toGrade, notes } = parsed.data;

      await prisma.$transaction(async (tx) => {
        const applyDelta = async (g: BrickGrade, delta: number) => {
          const row = await tx.brickInventory.findUnique({ where: { grade: g } });
          if (!row) {
            await tx.brickInventory.create({ data: { grade: g, quantity: Math.max(0, delta) } });
          } else {
            await tx.brickInventory.update({
              where: { grade: g },
              data: { quantity: Math.max(0, row.quantity + delta) },
            });
          }
        };

        if (type === "TRANSFER" && fromGrade && toGrade) {
          await applyDelta(fromGrade, -quantity);
          await applyDelta(toGrade, quantity);
        } else if (type === "STOCK_IN" || type === "PRODUCTION") {
          await applyDelta(grade, quantity);
        } else {
          await applyDelta(grade, -quantity);
        }

        await tx.inventoryMovement.create({
          data: { grade, quantity, type, fromGrade, toGrade, notes },
        });
      });

      const inventory = await prisma.brickInventory.findMany();
      return apiSuccess(inventory, 201);
    } catch {
      return apiError("Inventory update failed", 400);
    }
  }, "MANAGER");
}
