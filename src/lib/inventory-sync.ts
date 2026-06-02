import type { BrickGrade } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

const GRADE_FIELDS: { field: keyof ProductionDelta; grade: BrickGrade }[] = [
  { field: "rawProduced", grade: "RAW" },
  { field: "cookedProduced", grade: "COOKED" },
  { field: "gradeA", grade: "GRADE_A" },
  { field: "gradeB", grade: "GRADE_B" },
  { field: "broken", grade: "BROKEN" },
];

type ProductionDelta = {
  rawProduced: number;
  cookedProduced: number;
  gradeA: number;
  gradeB: number;
  broken: number;
};

export async function applyProductionToInventory(
  tx: Tx,
  delta: ProductionDelta,
  notes = "Production entry"
) {
  for (const { field, grade } of GRADE_FIELDS) {
    const qty = delta[field];
    if (qty <= 0) continue;
    const inv = await tx.brickInventory.findUnique({ where: { grade } });
    if (!inv) continue;
    await tx.brickInventory.update({
      where: { grade },
      data: { quantity: inv.quantity + qty },
    });
    await tx.inventoryMovement.create({
      data: {
        grade,
        quantity: qty,
        type: "PRODUCTION",
        notes,
      },
    });
  }
}

export async function deductInventoryForDispatch(
  tx: Tx,
  grade: BrickGrade,
  quantity: number,
  notes: string
) {
  const inv = await tx.brickInventory.findUnique({ where: { grade } });
  if (!inv || inv.quantity < quantity) {
    throw new Error(`Insufficient ${grade} stock (${inv?.quantity ?? 0} available)`);
  }
  await tx.brickInventory.update({
    where: { grade },
    data: { quantity: inv.quantity - quantity },
  });
  await tx.inventoryMovement.create({
    data: {
      grade,
      quantity,
      type: "STOCK_OUT",
      notes,
    },
  });
}
