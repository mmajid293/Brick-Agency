import { prisma } from "./prisma";
import { startOfDay, endOfDay, format } from "date-fns";

export type TodayAttendanceRow = {
  id: string;
  workerName: string;
  workerNameUrdu: string | null;
  workerCode: string | null;
  department: string;
  jobRole: string;
  status: string;
  regularHours: number;
  extraHours: number;
  bricksProduced: number | null;
  checkIn: string | null;
  checkOut: string | null;
  taskCompleted: string | null;
};

export type TodayProductionRow = {
  id: string;
  kilnCycle: number;
  rawProduced: number;
  cookedProduced: number;
  gradeA: number;
  gradeB: number;
  broken: number;
  wastage: number;
  temperature: number | null;
  notes: string | null;
};

export type TodayDispatchRow = {
  id: string;
  challanNo: string;
  truckNumber: string;
  driverName: string;
  bricksLoaded: number;
  customerName: string;
  orderNumber: string;
};

export type TodayOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
};

export type TodayMoneyRow = {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  time: string;
};

export type TodayAdvanceRow = {
  id: string;
  workerName: string;
  amount: number;
  reason: string | null;
};

export type TodayDashboardData = {
  date: string;
  dateLabel: string;
  dbAvailable: boolean;
  attendance: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
    overtime: number;
    marked: number;
    totalWorkers: number;
    extraHoursTotal: number;
    records: TodayAttendanceRow[];
  };
  production: {
    bricksTotal: number;
    records: TodayProductionRow[];
  };
  dispatches: {
    count: number;
    bricksLoaded: number;
    records: TodayDispatchRow[];
  };
  orders: {
    count: number;
    value: number;
    records: TodayOrderRow[];
  };
  income: {
    total: number;
    records: TodayMoneyRow[];
  };
  expenses: {
    total: number;
    records: TodayMoneyRow[];
  };
  advances: {
    count: number;
    total: number;
    records: TodayAdvanceRow[];
  };
  kiln: {
    temperature: number;
    fuelUsed: number;
    cycleNumber: number;
    recordedAt: string;
  } | null;
};

const emptyToday: TodayDashboardData = {
  date: format(new Date(), "yyyy-MM-dd"),
  dateLabel: format(new Date(), "EEEE, d MMMM yyyy"),
  dbAvailable: false,
  attendance: {
    present: 0,
    absent: 0,
    leave: 0,
    halfDay: 0,
    overtime: 0,
    marked: 0,
    totalWorkers: 0,
    extraHoursTotal: 0,
    records: [],
  },
  production: { bricksTotal: 0, records: [] },
  dispatches: { count: 0, bricksLoaded: 0, records: [] },
  orders: { count: 0, value: 0, records: [] },
  income: { total: 0, records: [] },
  expenses: { total: 0, records: [] },
  advances: { count: 0, total: 0, records: [] },
  kiln: null,
};

export async function getTodayDashboardData(): Promise<TodayDashboardData> {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const dateStr = format(today, "yyyy-MM-dd");

  try {
    const [
      attendanceRecords,
      totalWorkers,
      productionRecords,
      dispatchRecords,
      orderRecords,
      incomeRecords,
      expenseRecords,
      advanceRecords,
      kilnLog,
    ] = await Promise.all([
      prisma.attendance.findMany({
        where: { date: dayStart },
        include: {
          worker: {
            select: {
              name: true,
              nameUrdu: true,
              workerCode: true,
              department: true,
              jobRole: true,
            },
          },
        },
        orderBy: { worker: { name: "asc" } },
      }),
      prisma.worker.count({ where: { isActive: true } }),
      prisma.production.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        orderBy: { kilnCycle: "asc" },
      }),
      prisma.dispatch.findMany({
        where: { dispatchDate: { gte: dayStart, lte: dayEnd } },
        include: {
          order: {
            select: {
              orderNumber: true,
              customer: { select: { name: true } },
            },
          },
        },
        orderBy: { dispatchDate: "desc" },
      }),
      prisma.order.findMany({
        where: { orderDate: { gte: dayStart, lte: dayEnd } },
        include: { customer: { select: { name: true } } },
        orderBy: { orderDate: "desc" },
      }),
      prisma.transaction.findMany({
        where: { type: "INCOME", date: { gte: dayStart, lte: dayEnd } },
        orderBy: { date: "desc" },
      }),
      prisma.expense.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        orderBy: { date: "desc" },
      }),
      prisma.advance.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        include: { worker: { select: { name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.kilnLog.findFirst({
        where: { recordedAt: { gte: dayStart, lte: dayEnd } },
        orderBy: { recordedAt: "desc" },
      }),
    ]);

    const att = {
      present: 0,
      absent: 0,
      leave: 0,
      halfDay: 0,
      overtime: 0,
      extraHoursTotal: 0,
      records: attendanceRecords.map((r) => {
        const status = r.status;
        if (status === "PRESENT") att.present++;
        else if (status === "ABSENT") att.absent++;
        else if (status === "LEAVE") att.leave++;
        else if (status === "HALF_DAY") att.halfDay++;
        else if (status === "OVERTIME") att.overtime++;
        att.extraHoursTotal += Number(r.extraHours);
        return {
          id: r.id,
          workerName: r.worker.name,
          workerNameUrdu: r.worker.nameUrdu,
          workerCode: r.worker.workerCode,
          department: r.worker.department,
          jobRole: r.worker.jobRole,
          status: r.status,
          regularHours: Number(r.regularHours),
          extraHours: Number(r.extraHours),
          bricksProduced: r.bricksProduced,
          checkIn: r.checkIn?.toISOString() ?? null,
          checkOut: r.checkOut?.toISOString() ?? null,
          taskCompleted: r.taskCompleted,
        };
      }),
    };

    const production = {
      records: productionRecords.map((p) => ({
        id: p.id,
        kilnCycle: p.kilnCycle,
        rawProduced: p.rawProduced,
        cookedProduced: p.cookedProduced,
        gradeA: p.gradeA,
        gradeB: p.gradeB,
        broken: p.broken,
        wastage: p.wastage,
        temperature: p.temperature ? Number(p.temperature) : null,
        notes: p.notes,
      })),
      bricksTotal: productionRecords.reduce(
        (s, p) => s + p.cookedProduced + p.gradeA,
        0
      ),
    };

    const dispatches = {
      count: dispatchRecords.length,
      bricksLoaded: dispatchRecords.reduce((s, d) => s + d.bricksLoaded, 0),
      records: dispatchRecords.map((d) => ({
        id: d.id,
        challanNo: d.challanNo,
        truckNumber: d.truckNumber,
        driverName: d.driverName,
        bricksLoaded: d.bricksLoaded,
        customerName: d.order.customer.name,
        orderNumber: d.order.orderNumber,
      })),
    };

    const orders = {
      count: orderRecords.length,
      value: orderRecords.reduce((s, o) => s + Number(o.totalAmount), 0),
      records: orderRecords.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        quantity: o.quantity,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        paymentStatus: o.paymentStatus,
      })),
    };

    return {
      date: dateStr,
      dateLabel: format(today, "EEEE, d MMMM yyyy"),
      dbAvailable: true,
      attendance: {
        ...att,
        marked: attendanceRecords.length,
        totalWorkers,
      },
      production,
      dispatches,
      orders,
      income: {
        total: incomeRecords.reduce((s, t) => s + Number(t.amount), 0),
        records: incomeRecords.map((t) => ({
          id: t.id,
          description: t.description,
          amount: Number(t.amount),
          category: t.category,
          time: format(t.date, "HH:mm"),
        })),
      },
      expenses: {
        total: expenseRecords.reduce((s, e) => s + Number(e.amount), 0),
        records: expenseRecords.map((e) => ({
          id: e.id,
          description: e.title,
          amount: Number(e.amount),
          category: e.category,
          time: format(e.date, "HH:mm"),
        })),
      },
      advances: {
        count: advanceRecords.length,
        total: advanceRecords.reduce((s, a) => s + Number(a.amount), 0),
        records: advanceRecords.map((a) => ({
          id: a.id,
          workerName: a.worker.name,
          amount: Number(a.amount),
          reason: a.reason,
        })),
      },
      kiln: kilnLog
        ? {
            temperature: Number(kilnLog.temperature),
            fuelUsed: Number(kilnLog.fuelUsed),
            cycleNumber: kilnLog.cycleNumber,
            recordedAt: format(kilnLog.recordedAt, "HH:mm"),
          }
        : null,
    };
  } catch {
    return emptyToday;
  }
}
