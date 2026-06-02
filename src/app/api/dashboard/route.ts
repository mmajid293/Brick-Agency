import { getDashboardStats } from "@/lib/dashboard-data";
import { apiSuccess, withAuth } from "@/lib/api-utils";
export async function GET() {
  return withAuth(async () => apiSuccess(await getDashboardStats()), "WORKER");
}
