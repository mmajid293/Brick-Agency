import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withAuth } from "@/lib/api-utils";
import { startOfDay } from "date-fns";

/** Worker marks themselves present for today (one tap). */
export async function POST() {
  return withAuth(async (user) => {
    if (!user.workerId) {
      return apiError("No worker profile linked to this account", 404);
    }

    try {
      const today = startOfDay(new Date());
      const record = await prisma.attendance.upsert({
        where: { workerId_date: { workerId: user.workerId, date: today } },
        update: {
          status: "PRESENT",
          qrScanned: true,
          checkIn: new Date(),
        },
        create: {
          workerId: user.workerId,
          date: today,
          status: "PRESENT",
          qrScanned: true,
          checkIn: new Date(),
        },
      });

      return apiSuccess({
        message: "Checked in successfully",
        record,
      });
    } catch {
      return apiError("Could not save check-in", 503);
    }
  }, "WORKER");
}
