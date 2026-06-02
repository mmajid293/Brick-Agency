import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";
import { signToken, verifyToken, type JWTPayload } from "./jwt";

export type { JWTPayload } from "./jwt";
export { signToken, verifyToken };

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  nameUrdu: string | null;
  role: Role;
  avatar: string | null;
  workerId: string | null; 
};

function sessionFromPayload(payload: JWTPayload): SessionUser {
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    nameUrdu: null,
    role: payload.role,
    avatar: null,
    workerId: null,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("bhatha_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        nameUrdu: true,
        role: true,
        avatar: true,
        workerId: true,
      },
    });
    if (user) return user;
  } catch {
    // DB unavailable — trust valid JWT
  }

  return sessionFromPayload(payload);
}

export function hasPermission(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export { ROLE_HIERARCHY, canAccess } from "./roles";
