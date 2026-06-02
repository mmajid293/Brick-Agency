import { prisma } from "./prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";

const emptyStats = {
  bricksToday: 0,
  presentWorkers: 0,
  totalWorkers: 0,
  monthSales: 0,
  monthProfit: 0,
  pendingPayments: 0,
  materials: [] as { type: string; quantity: unknown; unit: string; minStock: unknown }[],
  kilnTemp: 0,
  fuelToday: 0,
  todayDispatches: 0,
  notifications: [] as { id: string; title: string; message: string }[],
  weather: null as { condition: string; temperature: number } | null,
  productionHistory: [] as { date: string; produced: number; wastage: number }[],
  expenseChart: [] as { category: string; amount: number }[],
  dbAvailable: false,
};

export async function getDashboardStats() {
  try {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const [
      todayProduction,
      presentWorkers,
      totalWorkers,
      monthIncome,
      monthExpense,
      pendingOrders,
      materials,
      latestKiln,
      todayDispatches,
      notifications,
      weather,
    ] = await Promise.all([
      prisma.production.aggregate({
        where: { date: { gte: dayStart, lte: dayEnd } },
        _sum: { cookedProduced: true, gradeA: true },
      }),
      prisma.attendance.count({
        where: { date: dayStart, status: { in: ["PRESENT", "OVERTIME"] } },
      }),
      prisma.worker.count({ where: { isActive: true } }),
      prisma.transaction.aggregate({
        where: { type: "INCOME", date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { paymentStatus: { in: ["PENDING", "PARTIAL"] } } }),
      prisma.rawMaterial.findMany(),
      prisma.kilnLog.findFirst({ orderBy: { recordedAt: "desc" } }),
      prisma.dispatch.count({
        where: { dispatchDate: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.notification.findMany({
        where: { isRead: false },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.weatherLog.findFirst({ orderBy: { recordedAt: "desc" } }),
    ]);

    const bricksToday =
      (todayProduction._sum.cookedProduced || 0) + (todayProduction._sum.gradeA || 0);
    const income = Number(monthIncome._sum.amount || 0);
    const expense = Number(monthExpense._sum.amount || 0);

    const productionHistory = await prisma.production.findMany({
      where: { date: { gte: subDays(today, 7) } },
      orderBy: { date: "asc" },
    });

    const expenseByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    });

    return {
      bricksToday,
      presentWorkers,
      totalWorkers,
      monthSales: income,
      monthProfit: income - expense,
      pendingPayments: pendingOrders,
      materials,
      kilnTemp: latestKiln ? Number(latestKiln.temperature) : 0,
      fuelToday: latestKiln ? Number(latestKiln.fuelUsed) : 0,
      todayDispatches,
      notifications,
      productionHistory: productionHistory.map((p) => ({
        date: p.date.toISOString().split("T")[0],
        produced: p.cookedProduced + p.gradeA,
        wastage: p.wastage,
      })),
      expenseChart: expenseByCategory.map((e) => ({
        category: e.category,
        amount: Number(e._sum.amount || 0),
      })),
      weather: weather
        ? { condition: weather.condition, temperature: Number(weather.temperature) }
        : null,
      dbAvailable: true,
    };
  } catch {
    return emptyStats;
  }
}
