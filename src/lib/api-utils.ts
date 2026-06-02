import { NextResponse } from "next/server";
import { getSession, canAccess } from "./auth";
import type { Role } from "@prisma/client";
import { RateLimiterMemory } from "rate-limiter-flexible";

const limiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

export async function rateLimit(ip: string) {
  try {
    await limiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function withAuth(
  handler: (user: NonNullable<Awaited<ReturnType<typeof getSession>>>) => Promise<NextResponse>,
  minRole: Role = "WORKER"
) {
  const user = await getSession();
  if (!user) return apiError("Unauthorized", 401);
  if (!canAccess(user.role, minRole)) return apiError("Forbidden", 403);
  return handler(user);
}

export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  ip?: string
) {
  const { prisma } = await import("./prisma");
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, details, ipAddress: ip },
  });
}
