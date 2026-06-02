import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import {
  canAccessDashboardPath,
  getLoginRedirect,
  workerForbiddenRedirect,
} from "@/lib/route-access";

const publicPaths = ["/", "/login", "/api/auth/login", "/api/auth/logout", "/api/health"];
const dashboardPrefix = "/dashboard";

const workerApiPrefixes = [
  "/api/portal",
  "/api/workers/me",
  "/api/auth/change-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bhatha_token")?.value;
  const session = token ? await verifyToken(token) : null;

  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      session.role === "WORKER" &&
      !workerApiPrefixes.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL(getLoginRedirect(session.role), request.url));
    }
    return NextResponse.next();
  }

  if (session && pathname.startsWith(dashboardPrefix)) {
    if (!canAccessDashboardPath(session.role, pathname)) {
      return NextResponse.redirect(
        new URL(workerForbiddenRedirect(session.role), request.url)
      );
    }
  }

  if (pathname.startsWith(dashboardPrefix)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest|brand).*)"],
};
