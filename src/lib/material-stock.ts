import type { PrismaClient, MaterialType } from "@prisma/client";

export async function logMaterialStockChange(
  prisma: PrismaClient,
  params: {
    materialType: MaterialType;
    previousQty: number;
    newQty: number;
    operation: string;
    notes?: string;
    recordedAt?: Date;
  }
) {
  const changeQty = params.newQty - params.previousQty;
  return prisma.materialStockLog.create({
    data: {
      materialType: params.materialType,
      previousQty: params.previousQty,
      newQty: params.newQty,
      changeQty,
      operation: params.operation,
      notes: params.notes,
      recordedAt: params.recordedAt ?? new Date(),
    },
  });
}
