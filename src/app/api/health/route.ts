import { apiSuccess } from "@/lib/api-utils";
export async function GET() { return apiSuccess({ status: "ok", app: "Smart Brick Agency" }); }
