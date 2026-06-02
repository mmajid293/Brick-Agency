import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["LOADING", "FIRING", "COOLING", "UNLOADED", "CANCELLED"]).optional(),
  fireStart: z.string().optional(),
  fireEnd: z.string().optional(),
  unloadDate: z.string().optional(),
  bricksOutA: z.coerce.number().int().min(0).optional(),
  bricksOutB: z.coerce.number().int().min(0).optional(),
  broken: z.coerce.number().int().min(0).optional(),
  temperature: z.coerce.number().optional(),
  fuelUsed: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async () => {
    const { id } = await params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.fireStart) data.fireStart = new Date(parsed.data.fireStart);
    if (parsed.data.fireEnd) data.fireEnd = new Date(parsed.data.fireEnd);
    if (parsed.data.unloadDate) data.unloadDate = new Date(parsed.data.unloadDate);

    const batch = await prisma.kilnBatch.update({
      where: { id },
      data,
    });

    if (batch.status === "UNLOADED" && (batch.bricksOutA > 0 || batch.bricksOutB > 0)) {
      const { applyProductionToInventory } = await import("@/lib/inventory-sync");
      await prisma.$transaction(async (tx) => {
        await applyProductionToInventory(
          tx,
          {
            rawProduced: 0,
            cookedProduced: 0,
            gradeA: batch.bricksOutA,
            gradeB: batch.bricksOutB,
            broken: batch.broken,
          },
          `Kiln batch #${batch.batchNumber} unload`
        );
      });
    }

    return apiSuccess(batch);
  }, "SUPERVISOR");
}
