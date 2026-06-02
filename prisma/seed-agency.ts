import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

export async function seedAgencyModule(prisma: PrismaClient) {
  const kilns = [
    { code: "K1", name: "Main Bhatta Kiln", nameUr: "مرکزی بھٹہ", capacity: 120000 },
    { code: "K2", name: "Secondary Kiln", nameUr: "دوسرا بھٹہ", capacity: 80000 },
  ];
  for (const k of kilns) {
    await prisma.kiln.upsert({
      where: { code: k.code },
      update: { name: k.name, nameUr: k.nameUr, capacity: k.capacity },
      create: k,
    });
  }

  const kiln1 = await prisma.kiln.findUnique({ where: { code: "K1" } });
  if (kiln1) {
    const existing = await prisma.kilnBatch.findFirst({
      where: { kilnId: kiln1.id, batchNumber: 13 },
    });
    if (!existing) {
      await prisma.kilnBatch.create({
        data: {
          kilnId: kiln1.id,
          batchNumber: 13,
          status: "FIRING",
          loadDate: new Date(),
          bricksIn: 95000,
          temperature: 920,
          fuelType: "Wood",
          fuelUsed: 12,
        },
      });
    }
  }

  const agents = [
    { code: "AG-01", name: "Chaudhry Saleem", phone: "+923001234501", commissionPct: 2.5 },
    { code: "AG-02", name: "Rana Builders Agency", phone: "+923001234502", commissionPct: 3 },
    { code: "AG-03", name: "Lahore Brick Sales", phone: "+923001234503", commissionPct: 2 },
  ];
  for (const a of agents) {
    await prisma.salesAgent.upsert({
      where: { code: a.code },
      update: a,
      create: a,
    });
  }

  const rates = [
    { brickGrade: "GRADE_A" as const, customerType: null, ratePerBrick: 14.5 },
    { brickGrade: "GRADE_A" as const, customerType: "BUILDER" as const, ratePerBrick: 14 },
    { brickGrade: "GRADE_B" as const, customerType: null, ratePerBrick: 11 },
    { brickGrade: "COOKED" as const, customerType: null, ratePerBrick: 9 },
  ];
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  for (const r of rates) {
    const exists = await prisma.brickRateCard.findFirst({
      where: {
        brickGrade: r.brickGrade,
        customerType: r.customerType,
        ratePerBrick: r.ratePerBrick,
      },
    });
    if (!exists) {
      await prisma.brickRateCard.create({
        data: {
          brickGrade: r.brickGrade,
          customerType: r.customerType,
          ratePerBrick: r.ratePerBrick,
          effectiveFrom: from,
        },
      });
    }
  }

  const agent1 = await prisma.salesAgent.findUnique({ where: { code: "AG-01" } });
  if (agent1) {
    await prisma.customer.updateMany({
      where: { salesAgentId: null },
      data: {},
    });
    const customers = await prisma.customer.findMany({ take: 3 });
    for (const c of customers) {
      await prisma.customer.update({
        where: { id: c.id },
        data: { salesAgentId: agent1.id, creditLimit: 500000 },
      });
    }
  }

  const demoUsers = [
    {
      email: "manager@bhatha.pk",
      password: "manager123",
      name: "Site Manager",
      role: "MANAGER" as const,
    },
    {
      email: "accountant@bhatha.pk",
      password: "accountant123",
      name: "Accounts Office",
      role: "ACCOUNTANT" as const,
    },
    {
      email: "supervisor@bhatha.pk",
      password: "supervisor123",
      name: "Shift Supervisor",
      role: "SUPERVISOR" as const,
    },
  ];

  const supervisorWorker = await prisma.worker.findFirst({
    where: { cnic: "35202-1000001-1" },
  });

  for (const u of demoUsers) {
    const hash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash: hash, isActive: true },
      create: {
        email: u.email,
        passwordHash: hash,
        name: u.name,
        role: u.role,
        isActive: true,
        workerId: u.role === "SUPERVISOR" ? supervisorWorker?.id : null,
      },
    });
  }

  const moldingWorker = await prisma.worker.findFirst({
    where: { category: { code: "BRICK_MOLDING" } },
  });
  if (moldingWorker) {
    const hash = await hashPassword("worker123");
    await prisma.user.upsert({
      where: { email: "worker@bhatha.pk" },
      update: {
        name: moldingWorker.name,
        role: "WORKER",
        passwordHash: hash,
        workerId: moldingWorker.id,
        isActive: true,
      },
      create: {
        email: "worker@bhatha.pk",
        passwordHash: hash,
        name: moldingWorker.name,
        role: "WORKER",
        workerId: moldingWorker.id,
        isActive: true,
      },
    });
  }

  console.log("✓ Agency module: kilns, agents, rate cards, role users");
}
