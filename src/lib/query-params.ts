import type { NextRequest } from "next/server";
import { paginationSchema } from "./validations";

export function parseListQuery(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return paginationSchema.parse({
    page: sp.get("page") ?? 1,
    limit: sp.get("limit") ?? 20,
    search: sp.get("search") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    order: sp.get("order") ?? "desc",
    status: sp.get("status") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
}

export function paginateMeta(total: number, page: number, limit: number) {
  return {
    total, 
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
