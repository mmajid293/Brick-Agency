import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { salesAgentSchema } from "@/lib/validations";

export async function GET() {
  return withAuth(async () => {
    const agents = await prisma.salesAgent.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { customers: true, orders: true } } },
    });
    return apiSuccess(agents);
  }, "MANAGER");
}

export async function POST(req: NextRequest) {
  return withAuth(async () => {
    const parsed = salesAgentSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Validation failed");
    const agent = await prisma.salesAgent.create({ data: parsed.data });
    return apiSuccess(agent, 201);
  }, "MANAGER");
}
