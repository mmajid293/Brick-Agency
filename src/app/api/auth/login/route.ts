import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signToken, type JWTPayload } from "@/lib/jwt";
import { apiSuccess, apiError, rateLimit } from "@/lib/api-utils";
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  ensureDefaultAdmin,
} from "@/lib/ensure-admin";

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

const DEMO_ADMIN: JWTPayload = {
  userId: "demo-admin",
  email: DEFAULT_ADMIN_EMAIL,
  role: "ADMIN",
  name: "Malik Rafique",
};

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

async function issueSession(user: JWTPayload, extra?: Record<string, unknown>) {
  const token = await signToken(user);
  const cookieStore = await cookies();
  cookieStore.set("bhatha_token", token, COOKIE_OPTS);
  return apiSuccess({
    user: {
      id: user.userId,
      name: user.name,
      role: user.role,
      email: user.email,
    },
    ...extra,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!(await rateLimit(ip))) return apiError("Too many requests", 429);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Invalid email or password", 401);

    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

    const isDefaultAdmin =
      email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;

    if (isDefaultAdmin) {
      try {
        const admin = await ensureDefaultAdmin();
        return issueSession({
          userId: admin.id,
          email: admin.email,
          role: "ADMIN",
          name: admin.name,
        });
      } catch (dbErr) {
        console.error("Login DB error (default admin):", dbErr);
        return issueSession(DEMO_ADMIN, {
          demoMode: true,
          warning:
            "Database offline — limited demo mode. Start PostgreSQL and run: npm run db:setup",
        });
      }
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && user.isActive && (await verifyPassword(password, user.passwordHash))) {
        return issueSession({
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        });
      }
    } catch (dbErr) {
      console.error("Login DB error:", dbErr);
    }

    return apiError("Invalid email or password", 401);
  } catch (err) {
    console.error("Login error:", err);
    return apiError("Login failed. Please try again.", 500);
  }
}
