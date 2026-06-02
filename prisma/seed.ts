import {
  PrismaClient,
  BrickGrade,
  MaterialType,
  Role,
  AttendanceStatus,
} from "@prisma/client";
import { subDays, startOfDay } from "date-fns";
import { SEED_CUSTOMERS } from "./seed-data";
import { getAllDemoWorkers } from "./seed-demo-workers";
import { seedDemoExtras } from "./seed-demo-extra";
import { seedAgencyModule } from "./seed-agency";
import { SEED_VEHICLES, SEED_ORDER_SPECS, SEED_DISPATCH_SPECS } from "./seed-vehicles-orders";
import { ensureDefaultAdmin } from "../src/lib/ensure-admin";
import { seedDepartmentsAndCategories } from "./seed-workforce";
import { categoryByCode, legacyRoleToCategory, type WorkerCategoryCode } from "../src/lib/worker-categories";

const prisma = new PrismaClient();

async function main() {
  console.log("🧱 Seeding Smart Bhatha ERP...");

  await ensureDefaultAdmin();

  const legacyEmails = [
    "manager@bhatha.pk",
    "accountant@bhatha.pk",
    "supervisor@bhatha.pk",
    "worker@bhatha.pk",
  ];
  const legacyUsers = await prisma.user.findMany({
    where: { email: { in: legacyEmails } },
    select: { id: true },
  });
  if (legacyUsers.length > 0) {
    const ids = legacyUsers.map((u) => u.id);
    await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }

  const grades: BrickGrade[] = ["RAW", "COOKED", "BROKEN", "GRADE_A", "GRADE_B"];
  for (const grade of grades) {
    const existing = await prisma.brickInventory.findFirst({ where: { grade } });
    if (!existing) {
      await prisma.brickInventory.create({
        data: {
          grade,
          quantity: grade === "GRADE_A" ? 125000 : grade === "RAW" ? 45000 : 15000,
        },
      });
    }
  }

  const materials: { type: MaterialType; quantity: number; unit: string; minStock: number }[] = [
    { type: "SOIL", quantity: 500, unit: "tons", minStock: 100 },
    { type: "COAL", quantity: 45, unit: "tons", minStock: 15 },
    { type: "WOOD", quantity: 85, unit: "tons", minStock: 25 },
    { type: "WOOD_WASTE", quantity: 42, unit: "tons", minStock: 15 },
    { type: "DIESEL", quantity: 2000, unit: "liters", minStock: 500 },
    { type: "WATER", quantity: 10000, unit: "liters", minStock: 0 },
    { type: "SAND", quantity: 120, unit: "tons", minStock: 30 },
  ];

  for (const m of materials) {
    const existing = await prisma.rawMaterial.findUnique({ where: { type: m.type } });
    const previousQty = existing ? Number(existing.quantity) : 0;
    await prisma.rawMaterial.upsert({
      where: { type: m.type },
      update: { quantity: m.quantity },
      create: m,
    });
    if (!existing || previousQty !== m.quantity) {
      await prisma.materialStockLog.create({
        data: {
          materialType: m.type,
          previousQty: previousQty,
          newQty: m.quantity,
          changeQty: m.quantity - previousQty,
          operation: "seed",
          notes: "Initial / seed stock",
        },
      });
    }
  }

  const { catMap, deptMap } = await seedDepartmentsAndCategories(prisma);
  console.log("✓ Departments & worker categories seeded");

  const DEMO_WORKERS = getAllDemoWorkers();
  const workers = [];
  const year = new Date().getFullYear();
  for (let i = 0; i < DEMO_WORKERS.length; i++) {
    const w = DEMO_WORKERS[i];
    const categoryCode = w.categoryCode ?? legacyRoleToCategory(w.jobRole);
    const catDef = categoryByCode(categoryCode)!;
    const categoryId = catMap.get(categoryCode)!;
    const departmentId = deptMap.get(catDef.departmentCode)!;
    const workerCode = `WB-${year}-${w.cnic.replace(/\D/g, "").slice(-6)}`;
    const worker = await prisma.worker.upsert({
      where: { cnic: w.cnic },
      update: {
        name: w.name,
        nameUrdu: w.nameUrdu,
        fatherName: w.fatherName,
        phone: w.phone,
        address: w.address,
        categoryId,
        departmentId,
        jobRole: w.jobRole,
        wageType: w.wageType ?? catDef.wageType,
        shiftType: w.shiftType ?? catDef.defaultShift ?? null,
        skillLevel: w.skillLevel ?? "SKILLED",
        dailyTarget: w.dailyTarget ?? w.bricksTargetPerDay ?? catDef.defaultTarget ?? null,
        productionAssignment: w.productionAssignment ?? null,
        workDescription: w.workDescription,
        department: w.department,
        dailyWage: w.dailyWage,
        perBrickRate: w.perBrickRate,
        monthlySalary: w.monthlySalary ?? catDef.defaultMonthly,
        perTruckRate: w.perTruckRate ?? catDef.defaultPerTruck,
        standardHoursPerDay: w.standardHoursPerDay,
        shiftStart: w.shiftStart,
        bricksTargetPerDay: w.bricksTargetPerDay ?? null,
        advanceBalance: w.advanceBalance ?? 0,
      },
      create: {
        workerCode,
        name: w.name,
        nameUrdu: w.nameUrdu,
        fatherName: w.fatherName,
        cnic: w.cnic,
        phone: w.phone,
        address: w.address,
        categoryId,
        departmentId,
        jobRole: w.jobRole,
        wageType: w.wageType ?? catDef.wageType,
        shiftType: w.shiftType ?? catDef.defaultShift ?? null,
        skillLevel: w.skillLevel ?? "SKILLED",
        dailyTarget: w.dailyTarget ?? w.bricksTargetPerDay ?? catDef.defaultTarget ?? null,
        productionAssignment: w.productionAssignment ?? null,
        workDescription: w.workDescription,
        department: w.department,
        dailyWage: w.dailyWage,
        perBrickRate: w.perBrickRate,
        monthlySalary: w.monthlySalary ?? catDef.defaultMonthly,
        perTruckRate: w.perTruckRate ?? catDef.defaultPerTruck,
        standardHoursPerDay: w.standardHoursPerDay,
        shiftStart: w.shiftStart,
        bricksTargetPerDay: w.bricksTargetPerDay ?? null,
        advanceBalance: w.advanceBalance ?? 0,
      },
    });
    workers.push(worker);
  }

  const cnicToCategory = new Map(DEMO_WORKERS.map((w) => [w.cnic, w.categoryCode ?? legacyRoleToCategory(w.jobRole)]));
  const allDbWorkers = await prisma.worker.findMany({ include: { category: true } });
  for (const w of allDbWorkers) {
    const code =
      (cnicToCategory.get(w.cnic) as WorkerCategoryCode | undefined) ??
      (w.category?.code as WorkerCategoryCode | undefined) ??
      legacyRoleToCategory(w.jobRole);
    const catDef = categoryByCode(code);
    if (!catDef) continue;
    const categoryId = catMap.get(code)!;
    const departmentId = deptMap.get(catDef.departmentCode)!;
    if (w.categoryId !== categoryId || w.departmentId !== departmentId) {
      await prisma.worker.update({
        where: { id: w.id },
        data: { categoryId, departmentId, wageType: w.wageType ?? catDef.wageType },
      });
    }
  }
  console.log(`✓ Workers seeded / backfilled — ${allDbWorkers.length} total in DB`);

  const demoCnicSet = new Set(DEMO_WORKERS.map((w) => w.cnic));
  const refreshedWorkers = await prisma.worker.findMany({
    where: { isActive: true },
    include: { category: true },
  });
  const countByCode = new Map<WorkerCategoryCode, number>();
  for (const code of catMap.keys()) countByCode.set(code as WorkerCategoryCode, 0);
  for (const w of refreshedWorkers) {
    const code = w.category?.code as WorkerCategoryCode | undefined;
    if (code) countByCode.set(code, (countByCode.get(code) ?? 0) + 1);
  }
  const categoryCodes = [...catMap.keys()] as WorkerCategoryCode[];
  const orphans = refreshedWorkers.filter((w) => !demoCnicSet.has(w.cnic));
  for (const w of orphans) {
    const minCode = categoryCodes.reduce((a, b) =>
      (countByCode.get(a) ?? 0) <= (countByCode.get(b) ?? 0) ? a : b,
    );
    const catDef = categoryByCode(minCode)!;
    await prisma.worker.update({
      where: { id: w.id },
      data: {
        categoryId: catMap.get(minCode)!,
        departmentId: deptMap.get(catDef.departmentCode)!,
        jobRole: catDef.legacyJobRole,
        wageType: catDef.wageType,
      },
    });
    countByCode.set(minCode, (countByCode.get(minCode) ?? 0) + 1);
  }
  if (orphans.length > 0) {
    console.log(`✓ Redistributed ${orphans.length} legacy workers across categories for demo balance`);
  }

  const supervisor = await prisma.worker.findFirst({ where: { cnic: "35202-1000001-1" } });
  if (supervisor) {
    const teamIds = workers.filter((w) => w.id !== supervisor.id).slice(0, 20).map((w) => w.id);
    await prisma.worker.updateMany({
      where: { id: { in: teamIds } },
      data: { supervisorId: supervisor.id },
    });
  }

  const today = startOfDay(new Date());
  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i];
    const profile = DEMO_WORKERS[i];
    const isPresent = i % 7 !== 0;
    const status = isPresent
      ? i % 11 === 0
        ? AttendanceStatus.OVERTIME
        : i % 9 === 0
          ? AttendanceStatus.HALF_DAY
          : AttendanceStatus.PRESENT
      : i % 2 === 0
        ? AttendanceStatus.ABSENT
        : AttendanceStatus.LEAVE;

    const regularHours =
      status === AttendanceStatus.HALF_DAY
        ? Number(profile.standardHoursPerDay) / 2
        : status === AttendanceStatus.PRESENT || status === AttendanceStatus.OVERTIME
          ? Number(profile.standardHoursPerDay)
          : 0;
    const extraHours =
      status === AttendanceStatus.OVERTIME ? 2 + (i % 3) : status === AttendanceStatus.PRESENT && i % 5 === 0 ? 1 : 0;
    const bricksProduced =
      profile.bricksTargetPerDay && isPresent
        ? Math.round(profile.bricksTargetPerDay * (status === AttendanceStatus.HALF_DAY ? 0.5 : 1) * (0.85 + (i % 5) * 0.03))
        : null;

    await prisma.attendance.upsert({
      where: { workerId_date: { workerId: worker.id, date: today } },
      update: {},
      create: {
        workerId: worker.id,
        date: today,
        status,
        checkIn: isPresent ? new Date(today.getTime() + 6 * 3600000 + i * 60000) : null,
        regularHours,
        extraHours,
        overtime: extraHours,
        bricksProduced,
      },
    });
  }

  for (let d = 0; d < 7; d++) {
    const date = subDays(today, d);
    await prisma.production.upsert({
      where: { date_kilnCycle: { date, kilnCycle: 1 } },
      update: {},
      create: {
        date,
        rawProduced: 15000 + d * 500,
        cookedProduced: 12000 + d * 400,
        gradeA: 10000 + d * 300,
        gradeB: 2000,
        broken: 500,
        wastage: 300 + d * 20,
        kilnCycle: 1,
        temperature: 920 + d * 5,
      },
    });
  }

  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-coal-supplier" },
    update: {},
    create: {
      id: "seed-coal-supplier",
      name: "Coal Wala Traders",
      phone: "+92421234567",
      address: "Lahore",
      material: "COAL",
    },
  });

  const existingPurchase = await prisma.purchase.findFirst({
    where: { supplierId: supplier.id, notes: "seed-coal" },
  });
  if (!existingPurchase) {
    await prisma.purchase.create({
      data: {
        supplierId: supplier.id,
        material: "COAL",
        quantity: 20,
        unitPrice: 25000,
        totalCost: 500000,
        notes: "seed-coal",
      },
    });
  }

  const customers = [];
  for (const c of SEED_CUSTOMERS) {
    const existing = await prisma.customer.findFirst({ where: { phone: c.phone } });
    const data = {
      name: c.name,
      companyName: c.companyName,
      customerType: c.customerType,
      contactPerson: c.contactPerson,
      email: c.email,
      address: c.address,
      city: c.city,
      notes: c.notes,
      balance: c.balance ?? 0,
    };
    const customer = existing
      ? await prisma.customer.update({ where: { id: existing.id }, data })
      : await prisma.customer.create({
          data: { ...data, phone: c.phone, cnic: null },
        });
    customers.push(customer);
  }

  for (const o of SEED_ORDER_SPECS) {
    const customer = customers[o.customerIdx];
    if (!customer) continue;
    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {
        quantity: o.qty,
        status: o.status,
        paidAmount: o.paid,
        paymentStatus: o.payment,
      },
      create: {
        orderNumber: o.orderNumber,
        customerId: customer.id,
        brickGrade: "GRADE_A",
        quantity: o.qty,
        ratePerBrick: o.rate,
        totalAmount: o.qty * o.rate,
        paidAmount: o.paid,
        paymentStatus: o.payment,
        status: o.status,
      },
    });
  }

  const truckDriver = await prisma.worker.findFirst({
    where: { cnic: "35202-1111133-3" },
  });

  for (const v of SEED_VEHICLES) {
    await prisma.vehicle.upsert({
      where: { registration: v.registration },
      update: {
        label: v.label,
        driverName: v.driverName,
        driverPhone: v.driverPhone,
        capacityBricks: v.capacityBricks,
      },
      create: {
        registration: v.registration,
        label: v.label,
        driverName: v.driverName,
        driverPhone: v.driverPhone,
        driverWorkerId: v.registration === "LEA-4521" && truckDriver ? truckDriver.id : null,
        capacityBricks: v.capacityBricks,
      },
    });
  }

  for (const d of SEED_DISPATCH_SPECS) {
    const order = await prisma.order.findUnique({ where: { orderNumber: d.orderNumber } });
    const vehicle = await prisma.vehicle.findUnique({ where: { registration: d.truck } });
    if (!order) continue;
    await prisma.dispatch.upsert({
      where: { challanNo: d.challanNo },
      update: {},
      create: {
        orderId: order.id,
        vehicleId: vehicle?.id ?? null,
        truckNumber: d.truck,
        driverName: d.driver,
        driverPhone: d.phone,
        bricksLoaded: d.bricks,
        challanNo: d.challanNo,
      },
    });
  }

  await prisma.transaction.createMany({
    data: [
      { type: "INCOME", amount: 2500000, description: "Brick sales - March", category: "Sales" },
      { type: "EXPENSE", amount: 450000, description: "Coal purchase", category: "Fuel" },
      { type: "EXPENSE", amount: 320000, description: "Worker wages", category: "Salary" },
      { type: "SALARY", amount: 85000, description: "Weekly payroll batch 1", category: "Salary" },
    ],
    skipDuplicates: true,
  });

  await prisma.expense.createMany({
    data: [
      { title: "Coal Purchase", titleUrdu: "کوئلے کی خریداری", amount: 450000, category: "Fuel" },
      { title: "Diesel", titleUrdu: "ڈیزل", amount: 85000, category: "Fuel" },
      { title: "Maintenance", titleUrdu: "مرمت", amount: 25000, category: "Operations" },
    ],
    skipDuplicates: true,
  });

  const month = today.getMonth() + 1;
  const yearNum = today.getFullYear();
  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i];
    const profile = DEMO_WORKERS[i];
    const monthly = Number(profile.monthlySalary ?? 0);
    const base = monthly > 0 ? monthly : Number(profile.dailyWage) * 26;
    const extraPay =
      monthly > 0 ? 0 : Math.round(Number(profile.dailyWage) / 8 * 1.5 * (i % 4));
    const deductions = Number(worker.advanceBalance) > 0 ? 2500 : 0;
    const brickBonus = profile.bricksTargetPerDay ? 2000 : profile.perTruckRate ? 1500 : 500;
    await prisma.payroll.upsert({
      where: { workerId_month_year: { workerId: worker.id, month, year: yearNum } },
      update: {},
      create: {
        workerId: worker.id,
        month,
        year: yearNum,
        baseSalary: base,
        brickBonus,
        overtimePay: extraPay,
        deductions,
        netPay: base + brickBonus + extraPay - deductions,
        isPaid: i % 3 !== 0,
      },
    });
  }

  const portalWorker =
    workers.find((w) => w.cnic === "35202-1000001-1") ?? workers[0];

  for (let d = 1; d <= 14; d++) {
    const date = subDays(today, d);
    const statuses: AttendanceStatus[] = [
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
      AttendanceStatus.LEAVE,
      AttendanceStatus.HALF_DAY,
    ];
    const status = statuses[d % statuses.length];
    const profile = DEMO_WORKERS.find((p) => p.cnic === portalWorker.cnic) ?? DEMO_WORKERS[0];
    const extraHours = status === AttendanceStatus.OVERTIME ? 2 : d % 4 === 0 ? 1.5 : 0;
    await prisma.attendance.upsert({
      where: { workerId_date: { workerId: portalWorker.id, date } },
      update: {},
      create: {
        workerId: portalWorker.id,
        date,
        status,
        checkIn: status !== AttendanceStatus.ABSENT ? new Date(date.getTime() + 7 * 3600000) : null,
        regularHours:
          status === AttendanceStatus.HALF_DAY ? 4 : status === AttendanceStatus.ABSENT ? 0 : Number(profile.standardHoursPerDay),
        extraHours,
        overtime: extraHours,
        bricksProduced: profile.bricksTargetPerDay
          ? Math.round(profile.bricksTargetPerDay * (status === AttendanceStatus.HALF_DAY ? 0.5 : 1))
          : null,
      },
    });
  }

  await seedAgencyModule(prisma);
  await seedDemoExtras(prisma, today);

  await prisma.weatherLog.create({
    data: { temperature: 32, humidity: 45, condition: "Sunny" },
  });

  const categoryCounts = await prisma.worker.groupBy({
    by: ["categoryId"],
    _count: true,
    where: { isActive: true },
  });
  console.log(`✅ Seed complete — ${workers.length} demo workers upserted, ${categoryCounts.length} categories with staff, ${customers.length} customers.`);
  console.log("   Admin: admin@bhatha.pk / admin123");
  console.log("   Manager: manager@bhatha.pk / manager123");
  console.log("   Accountant: accountant@bhatha.pk / accountant123");
  console.log("   Supervisor: supervisor@bhatha.pk / supervisor123");
  console.log("   Worker: worker@bhatha.pk / worker123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
