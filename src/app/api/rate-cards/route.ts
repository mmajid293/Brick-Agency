import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { rateCardSchema } from "@/lib/validations";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    const grade = req.nextUrl.searchParams.get("grade");
    const cards = await prisma.brickRateCard.findMany({
      where: grade ? { brickGrade: grade as "GRADE_A" } : undefined,
      orderBy: { effectiveFrom: "desc" },
      take: 100,
    });
    return apiSuccess(cards);
  }, "MANAGER");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const parsed = rateCardSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");
    const card = await prisma.brickRateCard.create({
      data: {
        brickGrade: parsed.data.brickGrade,
        customerType: parsed.data.customerType ?? null,
        ratePerBrick: parsed.data.ratePerBrick,
        effectiveFrom: startOfDay(new Date(parsed.data.effectiveFrom)),
        effectiveTo: parsed.data.effectiveTo
          ? startOfDay(new Date(parsed.data.effectiveTo))
          : null,
        notes: parsed.data.notes,
      },
    });
    return apiSuccess(card, 201);
  }, "MANAGER");
}
