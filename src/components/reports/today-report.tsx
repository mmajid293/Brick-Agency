"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Users, Boxes, Truck, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPKR, formatNumber, cn } from "@/lib/utils";
import { attendanceStatusLabel } from "@/lib/attendance-status";
import { workerJobRoleLabel } from "@/lib/worker-roles";
import { useApp } from "@/context/app-context";
import type { TodayDashboardData } from "@/lib/today-dashboard-data";

function SectionCard({
  title,
  summary,
  href,
  icon: Icon,
  children,
}: {
  title: string;
  summary: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <article className="glass-card heat-glow overflow-hidden rounded-xl border border-outline-variant/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-primary">{summary}</p>
          </div>
        </div>
        <Link href={href}>
          <Button size="sm" variant="ghost" type="button">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      {children}
    </article>
  );
}

export function TodayReport() {
  const { locale } = useApp();
  const [data, setData] = useState<TodayDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/today", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastRefresh(new Date());
      } else setError(json.error || "Failed");
    } catch {
      setError("Could not reach server");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
        <p>{error}</p>
        <Button className="mt-3" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const fmtTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-on-surface-variant">{data.dateLabel}</p>
          {lastRefresh && (
            <p className="text-xs text-on-surface-variant">
              Updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          {locale === "ur" ? "تازہ کریں" : "Refresh live"}
        </Button>
      </div>

      {!data.dbAvailable && (
        <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          Database offline — run: npm run db:setup
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title={locale === "ur" ? "حاضری" : "Attendance"}
          summary={`${data.attendance.present}/${data.attendance.totalWorkers} present`}
          href={`/dashboard/attendance?date=${data.date}`}
          icon={Users}
        >
          <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
            {data.attendance.records.length === 0 ? (
              <li className="text-on-surface-variant">No records yet</li>
            ) : (
              data.attendance.records.map((r) => (
                <li key={r.id} className="rounded border border-outline-variant/20 p-2">
                  <p className="font-medium">{locale === "ur" && r.workerNameUrdu ? r.workerNameUrdu : r.workerName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {workerJobRoleLabel(r.jobRole, locale)} · {attendanceStatusLabel(r.status, locale)}
                    {r.checkIn ? ` · ${fmtTime(r.checkIn)}` : ""}
                    {r.checkOut ? ` – ${fmtTime(r.checkOut)}` : ""}
                  </p>
                </li>
              ))
            )}
          </ul>
        </SectionCard>

        <SectionCard
          title={locale === "ur" ? "پیداوار" : "Production"}
          summary={`${formatNumber(data.production.bricksTotal)} bricks`}
          href="/dashboard/production"
          icon={Boxes}
        >
          <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
            {data.production.records.length === 0 ? (
              <li className="text-on-surface-variant">No production logged</li>
            ) : (
              data.production.records.map((r) => (
                <li key={r.id} className="rounded border border-outline-variant/20 p-2">
                  <p className="font-medium">Cycle #{r.kilnCycle}</p>
                  <p className="text-xs text-on-surface-variant">
                    Raw {formatNumber(r.rawProduced)} · Cooked {formatNumber(r.cookedProduced)} · A {formatNumber(r.gradeA)} / B {formatNumber(r.gradeB)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </SectionCard>

        <SectionCard
          title={locale === "ur" ? "ڈسپیچ" : "Dispatch"}
          summary={`${data.dispatches.count} trucks · ${formatNumber(data.dispatches.bricksLoaded)} bricks`}
          href="/dashboard/dispatch"
          icon={Truck}
        >
          <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
            {data.dispatches.records.length === 0 ? (
              <li className="text-on-surface-variant">No dispatches today</li>
            ) : (
              data.dispatches.records.map((r) => (
                <li key={r.id} className="rounded border border-outline-variant/20 p-2">
                  <p className="font-medium">{r.challanNo} — {r.customerName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {r.truckNumber} · {formatNumber(r.bricksLoaded)} bricks
                  </p>
                </li>
              ))
            )}
          </ul>
        </SectionCard>

        <SectionCard
          title={locale === "ur" ? "آمدنی و اخراجات" : "Income & expenses"}
          summary={`+${formatPKR(data.income.total)} / -${formatPKR(data.expenses.total)}`}
          href="/dashboard/finance"
          icon={TrendingUp}
        >
          <div className="grid max-h-56 gap-3 overflow-y-auto text-sm md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-green-600">Income</p>
              {data.income.records.length === 0 ? (
                <p className="text-on-surface-variant">None</p>
              ) : (
                data.income.records.map((r) => (
                  <p key={r.id} className="border-b border-outline-variant/10 py-1">
                    {r.description} <span className="text-green-600">{formatPKR(r.amount)}</span>
                  </p>
                ))
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-red-600">Expenses</p>
              {data.expenses.records.length === 0 ? (
                <p className="text-on-surface-variant">None</p>
              ) : (
                data.expenses.records.map((r) => (
                  <p key={r.id} className="border-b border-outline-variant/10 py-1">
                    {r.description} <span className="text-red-600">{formatPKR(r.amount)}</span>
                  </p>
                ))
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {(data.orders.records.length > 0 || data.advances.records.length > 0 || data.kiln) && (
        <div className="grid gap-4 md:grid-cols-3">
          {data.orders.records.length > 0 && (
            <article className="glass-card rounded-xl border p-4 md:col-span-1">
              <h3 className="mb-2 font-semibold">{locale === "ur" ? "آرڈرز" : "Orders today"}</h3>
              <p className="mb-2 text-sm text-primary">{data.orders.count} · {formatPKR(data.orders.value)}</p>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
                {data.orders.records.map((o) => (
                  <li key={o.id}>
                    {o.orderNumber} — {o.customerName} ({formatNumber(o.quantity)})
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/orders" className="mt-2 inline-block text-sm text-primary underline">
                View all
              </Link>
            </article>
          )}
          {data.advances.records.length > 0 && (
            <article className="glass-card rounded-xl border p-4">
              <h3 className="mb-2 font-semibold">{locale === "ur" ? "ایڈوانس" : "Advances"}</h3>
              <p className="mb-2 text-sm">{formatPKR(data.advances.total)} ({data.advances.count})</p>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
                {data.advances.records.map((a) => (
                  <li key={a.id}>
                    {a.workerName}: {formatPKR(a.amount)}
                  </li>
                ))}
              </ul>
            </article>
          )}
          {data.kiln && (
            <article className="glass-card rounded-xl border p-4">
              <h3 className="mb-2 font-semibold">{locale === "ur" ? "بھٹہ" : "Kiln"}</h3>
              <p className="text-sm">
                Cycle {data.kiln.cycleNumber} · {data.kiln.temperature}°C · Fuel {data.kiln.fuelUsed}
              </p>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
