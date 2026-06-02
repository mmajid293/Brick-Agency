import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

/** Must match in middleware (edge) and API routes (node). */
export const JWT_SECRET =
  process.env.JWT_SECRET || "smart-bhatha-dev-secret-change-in-production-2026";

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const exp = /^\d+$/.test(JWT_EXPIRES_IN) ? `${JWT_EXPIRES_IN}d` : JWT_EXPIRES_IN;
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
