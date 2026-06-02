import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { salesAgentSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await req.json();
    const parsed = salesAgentSchema.partial().safeParse(body);
    if (!parsed.success) return apiError("Validation failed");
    const agent = await prisma.salesAgent.update({ where: { id }, data: parsed.data });
    return apiSuccess(agent);
  }, "MANAGER");
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async () => {
    const { id } = await params;
    await prisma.salesAgent.update({ where: { id }, data: { isActive: false } });
    return apiSuccess({ ok: true });
  }, "MANAGER");
}
