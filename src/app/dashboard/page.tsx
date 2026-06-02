import { getDashboardStats } from "@/lib/dashboard-data";
import { getTodayDashboardData } from "@/lib/today-dashboard-data";
import { TodayDashboard } from "@/components/dashboard/today-dashboard";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardCharts } from "@/components/dashboard/charts";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardHomeExtra } from "@/components/dashboard/dashboard-home-extra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, today] = await Promise.all([getDashboardStats(), getTodayDashboardData()]);

  const forecastBricks = Math.round(stats.bricksToday * 1.08);
  const productivity =
    stats.totalWorkers > 0
      ? Math.round((stats.presentWorkers / stats.totalWorkers) * 100)
      : 0;

  return (
    <div className="easy-page flex w-full min-w-0 flex-col gap-8">
      {!stats.dbAvailable && (
        <div className="w-full rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 text-center text-base text-amber-900 dark:text-amber-100">
          Database is not connected. Ask your admin to run: npm run db:setup
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-8">
        <DashboardHero />
        <DashboardHomeExtra />
      </div>

      <TodayDashboard data={today} />

      <div className="w-full min-w-0 space-y-8">
        <StatsCards
          bricksToday={stats.bricksToday}
          presentWorkers={stats.presentWorkers}
          totalWorkers={stats.totalWorkers}
          monthSales={stats.monthSales}
          pendingPayments={stats.pendingPayments}
          kilnTemp={stats.kilnTemp}
          fuelToday={stats.fuelToday}
          todayDispatches={stats.todayDispatches}
          monthProfit={stats.monthProfit}
        />
        <DashboardCharts
          productionHistory={stats.productionHistory}
          expenseChart={stats.expenseChart}
          monthProfit={stats.monthProfit}
        />
        <div className="grid w-full gap-6 md:grid-cols-2">
          <Card className="heat-glow min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.notifications.length === 0 ? (
                <p className="text-base text-on-surface-variant">No new alerts</p>
              ) : (
                stats.notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-outline-variant/30 bg-surface-container/50 p-3 text-base"
                  >
                    <p className="font-semibold text-on-surface">{n.title}</p>
                    <p className="text-on-surface-variant">{n.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="heat-glow min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Tomorrow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base text-on-surface-variant">
              <p>
                Expected bricks:{" "}
                <strong className="text-on-surface">{formatNumber(forecastBricks)}</strong>
              </p>
              <p>
                Workers working: <strong className="text-on-surface">{productivity}%</strong>
              </p>
              {stats.weather && (
                <p>
                  Weather: {stats.weather.condition} — {Number(stats.weather.temperature)}°C
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
