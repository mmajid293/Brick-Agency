import type { PrismaClient } from "@prisma/client";
import { subDays, startOfDay } from "date-fns";
import type { WorkerCategoryCode } from "../src/lib/worker-categories";

export async function seedDemoExtras(prisma: PrismaClient, today: Date) {
  const day = startOfDay(today);

  await prisma.kilnLog.createMany({
    data: [
      { temperature: 945, fuelUsed: 2.5, fuelType: "Wood", cycleNumber: 12, notes: "Night cycle" },
      { temperature: 920, fuelUsed: 1.8, fuelType: "Wood waste", cycleNumber: 11 },
      { temperature: 880, fuelUsed: 3.2, fuelType: "Coal", cycleNumber: 10 },
      { temperature: 910, fuelUsed: 2.1, fuelType: "Wood", cycleNumber: 9 },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      { title: "Low wood stock", message: "Firewood below minimum — order more", type: "warning" },
      { title: "Truck dispatched", message: "LEA-4521 — 5000 bricks to Lahore", type: "info" },
      { title: "Kiln cycle complete", message: "Cycle #12 finished — Grade A ready", type: "success" },
      { title: "Payroll due", message: "Monthly payroll pending for 12 workers", type: "warning" },
      { title: "New order", message: "ORD-2026-006 — 50000 bricks confirmed", type: "info" },
    ],
    skipDuplicates: true,
  });

  await prisma.inventoryMovement.createMany({
    data: [
      { grade: "GRADE_A", quantity: 5000, type: "PRODUCTION", notes: "Kiln cycle 12 output" },
      { grade: "RAW", quantity: 8000, type: "PRODUCTION", notes: "Molding yard" },
      { grade: "BROKEN", quantity: 200, type: "WASTAGE", notes: "Quality sort" },
    ],
    skipDuplicates: true,
  });

  const suppliers = [
    { name: "Wood Supplier Muridke", phone: "+924211122301", material: "WOOD" as const },
    { name: "Mitti Wala Sheikhupura", phone: "+924211122302", material: "SOIL" as const },
    { name: "Diesel Pump GT Road", phone: "+924211122303", material: "DIESEL" as const },
  ];

  for (const s of suppliers) {
    const existing = await prisma.supplier.findFirst({ where: { phone: s.phone } });
    if (!existing) {
      await prisma.supplier.create({
        data: { name: s.name, phone: s.phone, address: "Punjab", material: s.material },
      });
    }
  }

  const workers = await prisma.worker.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 40,
  });

  for (let d = 1; d <= 5; d++) {
    const date = subDays(day, d);
    for (let i = 0; i < Math.min(workers.length, 25); i++) {
      const w = workers[i];
      const catCode = (w.category?.code ?? "GENERAL_HELPER") as WorkerCategoryCode;
      const present = (i + d) % 6 !== 0;
      const status = present ? "PRESENT" : i % 2 === 0 ? "ABSENT" : "LEAVE";
      const target = w.bricksTargetPerDay ?? w.dailyTarget ?? null;

      await prisma.attendance.upsert({
        where: { workerId_date: { workerId: w.id, date } },
        update: {},
        create: {
          workerId: w.id,
          date,
          status: status as "PRESENT",
          checkIn: present ? new Date(date.getTime() + 6 * 3600000) : null,
          checkOut: present && d % 2 === 0 ? new Date(date.getTime() + 15 * 3600000) : null,
          regularHours: present ? Number(w.standardHoursPerDay) : 0,
          extraHours: present && i % 4 === 0 ? 1.5 : 0,
          bricksProduced:
            target && catCode === "BRICK_MOLDING" && present
              ? Math.round(target * (0.8 + (i % 5) * 0.04))
              : null,
          workReport:
            catCode === "WOOD_FUEL" && present
              ? { woodTons: 2 + (i % 3), woodWasteTons: 1, kilnLoads: 3 }
              : catCode === "BRICK_LOADER" && present
                ? { bricksLoaded: 4500, truckLoads: 2 }
                : undefined,
        },
      });
    }
  }

  console.log("✓ Demo extras: kiln logs, notifications, attendance history, suppliers");
}
