import { NextRequest } from "next/server";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { getActiveRate } from "@/lib/agency";
import type { BrickGrade, CustomerType } from "@prisma/client";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    const grade = req.nextUrl.searchParams.get("grade") as BrickGrade | null;
    const customerType = req.nextUrl.searchParams.get("customerType") as CustomerType | null;
    if (!grade) return apiError("grade required");
    const rate = await getActiveRate(grade, customerType);
    return apiSuccess({ ratePerBrick: rate });
  }, "MANAGER");
}
