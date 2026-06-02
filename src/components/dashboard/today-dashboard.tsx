"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Boxes,
  Truck,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Banknote,
  Thermometer,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPKR, formatNumber } from "@/lib/utils";
import { attendanceStatusLabel } from "@/lib/attendance-status";
import { workerJobRoleLabel } from "@/lib/worker-roles";
import { useApp } from "@/context/app-context";
import type { TodayDashboardData } from "@/lib/today-dashboard-data";
import { cn } from "@/lib/utils";

type DetailKey =
  | "attendance"
  | "production"
  | "dispatches"
  | "orders"
  | "income"
  | "expenses"
  | "advances"
  | "kiln"
  | null;

type Props = {
  data: TodayDashboardData;
};

export function TodayDashboard({ data }: Props) {
  const { locale } = useApp();
  const [detail, setDetail] = useState<DetailKey>(null);

  const cards: {
    key: DetailKey;
    icon: typeof Users;
    labelEn: string;
    labelUr: string;
    value: string;
    sub?: string;
    href: string;
    color: string;
  }[] = [
    {
      key: "attendance",
      icon: Users,
      labelEn: "Attendance today",
      labelUr: "آج کی حاضری",
      value: `${data.attendance.present}/${data.attendance.totalWorkers}`,
      sub:
        locale === "ur"
          ? `${data.attendance.marked} نشان زد · ${data.attendance.extraHoursTotal} اضافی گھنٹے`
          : `${data.attendance.marked} marked · ${data.attendance.extraHoursTotal} extra hrs`,
      href: `/dashboard/attendance?date=${data.date}`,
      color: "from-green-500/15 to-green-600/5 border-green-500/30",
    },
    {
      key: "production",
      icon: Boxes,
      labelEn: "Production today",
      labelUr: "آج کی پیداوار",
      value: formatNumber(data.production.bricksTotal),
      sub:
        locale === "ur"
          ? `${data.production.records.length} سائیکل`
          : `${data.production.records.length} kiln cycle(s)`,
      href: `/dashboard/production`,
      color: "from-brick/15 to-primary/5 border-brick/30",
    },
    {
      key: "dispatches",
      icon: Truck,
      labelEn: "Dispatches today",
      labelUr: "آج کی گاڑیاں",
      value: String(data.dispatches.count),
      sub:
        locale === "ur"
          ? `${formatNumber(data.dispatches.bricksLoaded)} اینٹ`
          : `${formatNumber(data.dispatches.bricksLoaded)} bricks loaded`,
      href: "/dashboard/dispatch",
      color: "from-blue-500/15 to-blue-600/5 border-blue-500/30",
    },
    {
      key: "orders",
      icon: ShoppingCart,
      labelEn: "Orders today",
      labelUr: "آج کے آرڈر",
      value: String(data.orders.count),
      sub: formatPKR(data.orders.value),
      href: "/dashboard/customers",
      color: "from-purple-500/15 to-purple-600/5 border-purple-500/30",
    },
    {
      key: "income",
      icon: TrendingUp,
      labelEn: "Income today",
      labelUr: "آج کی آمدنی",
      value: formatPKR(data.income.total),
      sub:
        locale === "ur"
          ? `${data.income.records.length} لین دین`
          : `${data.income.records.length} entries`,
      href: "/dashboard/finance",
      color: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/30",
    },
    {
      key: "expenses",
      icon: Wallet,
      labelEn: "Expenses today",
      labelUr: "آج کے اخراجات",
      value: formatPKR(data.expenses.total),
      sub:
        locale === "ur"
          ? `${data.expenses.records.length} اخراجات`
          : `${data.expenses.records.length} expenses`,
      href: "/dashboard/finance",
      color: "from-amber-500/15 to-amber-600/5 border-amber-500/30",
    },
    {
      key: "advances",
      icon: Banknote,
      labelEn: "Advances today",
      labelUr: "آج کی پیشگی",
      value: formatPKR(data.advances.total),
      sub:
        locale === "ur"
          ? `${data.advances.count} مزدور`
          : `${data.advances.count} workers`,
      href: "/dashboard/workers",
      color: "from-orange-500/15 to-orange-600/5 border-orange-500/30",
    },
  ];

  if (data.kiln) {
    cards.push({
      key: "kiln",
      icon: Thermometer,
      labelEn: "Kiln today",
      labelUr: "آج کی بھٹی",
      value: `${data.kiln.temperature}°C`,
      sub:
        locale === "ur"
          ? `ایندھن ${data.kiln.fuelUsed} · سائیکل ${data.kiln.cycleNumber}`
          : `Fuel ${data.kiln.fuelUsed} · Cycle ${data.kiln.cycleNumber}`,
      href: "/dashboard/production",
      color: "from-red-500/15 to-red-600/5 border-red-500/30",
    });
  }

  const detailTitle = (key: DetailKey) => {
    const c = cards.find((x) => x.key === key);
    if (!c) return "";
    return locale === "ur" ? c.labelUr : c.labelEn;
  };

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface sm:text-2xl">
              {locale === "ur" ? "آج کا خلاصہ" : "Today's dashboard"}
            </h2>
            <p className="text-sm text-on-surface-variant">{data.dateLabel}</p>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">
          {locale === "ur" ? "کارڈ پر ٹیپ کریں — مکمل ریکارڈ" : "Tap a card for full today's records"}
        </p>
      </div>


      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setDetail(card.key)}
              className={cn(
                "easy-tap glass-card heat-glow group w-full rounded-xl border-2 bg-gradient-to-br p-4 text-left transition",
                "hover:scale-[1.02] hover:border-primary/50 active:scale-[0.99]",
                card.color
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="rounded-lg bg-primary/15 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                {locale === "ur" ? card.labelUr : card.labelEn}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-on-surface">{card.value}</p>
              {card.sub && <p className="mt-1 text-sm text-on-surface-variant">{card.sub}</p>}
            </button>
          );
        })}
      </div>


      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{detailTitle(detail)}</DialogTitle>
            <p className="text-sm text-on-surface-variant">{data.dateLabel}</p>
          </DialogHeader>

          {detail === "attendance" && (
            <TodayDetailBody
              empty={data.attendance.records.length === 0}
              emptyText={locale === "ur" ? "آج کوئی حاضری نہیں" : "No attendance marked today"}
              href={`/dashboard/attendance?date=${data.date}`}
              locale={locale}
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-800">
                  {locale === "ur" ? "حاضر" : "Present"}: {data.attendance.present}
                </Badge>
                <Badge variant="outline">
                  {locale === "ur" ? "غیر حاضر" : "Absent"}: {data.attendance.absent}
                </Badge>
                <Badge variant="outline">
                  {locale === "ur" ? "چھٹی" : "Leave"}: {data.attendance.leave}
                </Badge>
              </div>
              <ul className="space-y-2">
                {data.attendance.records.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant/30 bg-surface-container/40 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{r.workerName}</p>
                      {r.workerNameUrdu && (
                        <p className="font-urdu text-on-surface-variant">{r.workerNameUrdu}</p>
                      )}
                      <p className="text-xs text-on-surface-variant">
                        {workerJobRoleLabel(r.jobRole, locale === "ur" ? "ur" : "en")} · {r.regularHours}h
                        {r.extraHours > 0 ? ` +${r.extraHours} extra` : ""}
                      </p>
                    </div>
                    <Badge variant="outline">{attendanceStatusLabel(r.status, locale)}</Badge>
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "production" && (
            <TodayDetailBody
              empty={data.production.records.length === 0}
              emptyText={locale === "ur" ? "آج کی پیداوار درج نہیں" : "No production logged today"}
              href="/dashboard/production"
              locale={locale}
            >
              <ul className="space-y-3">
                {data.production.records.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-lg border border-outline-variant/30 bg-surface-container/40 p-3 text-sm"
                  >
                    <p className="font-semibold">
                      {locale === "ur" ? "سائیکل" : "Cycle"} {p.kilnCycle}
                      {p.temperature != null && ` · ${p.temperature}°C`}
                    </p>
                    <p className="mt-1 text-on-surface-variant">
                      Raw {formatNumber(p.rawProduced)} · Cooked {formatNumber(p.cookedProduced)} · A{" "}
                      {formatNumber(p.gradeA)} · B {formatNumber(p.gradeB)} · Wastage{" "}
                      {formatNumber(p.wastage)}
                    </p>
                    {p.notes && <p className="mt-1 text-xs">{p.notes}</p>}
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "dispatches" && (
            <TodayDetailBody
              empty={data.dispatches.records.length === 0}
              emptyText={locale === "ur" ? "آج کوئی ڈسپیچ نہیں" : "No dispatches today"}
              href="/dashboard/dispatch"
              locale={locale}
            >
              <ul className="space-y-2">
                {data.dispatches.records.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-lg border border-outline-variant/30 bg-surface-container/40 p-3 text-sm"
                  >
                    <p className="font-semibold">{d.challanNo} — {d.truckNumber}</p>
                    <p className="text-on-surface-variant">
                      {d.customerName} · {d.orderNumber}
                    </p>
                    <p>
                      {formatNumber(d.bricksLoaded)} bricks · {d.driverName}
                    </p>
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "orders" && (
            <TodayDetailBody
              empty={data.orders.records.length === 0}
              emptyText={locale === "ur" ? "آج کوئی آرڈر نہیں" : "No orders today"}
              href="/dashboard/customers"
              locale={locale}
            >
              <ul className="space-y-2">
                {data.orders.records.map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between rounded-lg border border-outline-variant/30 bg-surface-container/40 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{o.orderNumber}</p>
                      <p className="text-on-surface-variant">{o.customerName}</p>
                      <p className="text-xs">
                        {formatNumber(o.quantity)} bricks · {o.status} / {o.paymentStatus}
                      </p>
                    </div>
                    <p className="font-bold text-primary">{formatPKR(o.totalAmount)}</p>
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "income" && (
            <TodayDetailBody
              empty={data.income.records.length === 0}
              emptyText={locale === "ur" ? "آج کوئی آمدنی نہیں" : "No income today"}
              href="/dashboard/finance"
              locale={locale}
            >
              <p className="mb-3 text-lg font-bold text-green-700">{formatPKR(data.income.total)}</p>
              <ul className="space-y-2">
                {data.income.records.map((t) => (
                  <li
                    key={t.id}
                    className="flex justify-between rounded-lg border border-outline-variant/30 p-3 text-sm"
                  >
                    <span>
                      {t.description}
                      {t.category && (
                        <span className="ml-1 text-xs text-on-surface-variant">({t.category})</span>
                      )}
                    </span>
                    <span className="font-semibold text-green-700">
                      {formatPKR(t.amount)} · {t.time}
                    </span>
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "expenses" && (
            <TodayDetailBody
              empty={data.expenses.records.length === 0}
              emptyText={locale === "ur" ? "آج کوئی خرچ نہیں" : "No expenses today"}
              href="/dashboard/finance"
              locale={locale}
            >
              <p className="mb-3 text-lg font-bold text-amber-700">{formatPKR(data.expenses.total)}</p>
              <ul className="space-y-2">
                {data.expenses.records.map((e) => (
                  <li
                    key={e.id}
                    className="flex justify-between rounded-lg border border-outline-variant/30 p-3 text-sm"
                  >
                    <span>
                      {e.description}
                      {e.category && (
                        <span className="ml-1 text-xs text-on-surface-variant">({e.category})</span>
                      )}
                    </span>
                    <span className="font-semibold text-amber-700">
                      {formatPKR(e.amount)} · {e.time}
                    </span>
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "advances" && (
            <TodayDetailBody
              empty={data.advances.records.length === 0}
              emptyText={locale === "ur" ? "آج کوئی پیشگی نہیں" : "No advances today"}
              href="/dashboard/workers"
              locale={locale}
            >
              <p className="mb-3 text-lg font-bold text-amber-700">{formatPKR(data.advances.total)}</p>
              <ul className="space-y-2">
                {data.advances.records.map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between rounded-lg border border-outline-variant/30 p-3 text-sm"
                  >
                    <span>
                      {a.workerName}
                      {a.reason && <span className="block text-xs text-on-surface-variant">{a.reason}</span>}
                    </span>
                    <span className="font-semibold">{formatPKR(a.amount)}</span>
                  </li>
                ))}
              </ul>
            </TodayDetailBody>
          )}

          {detail === "kiln" && data.kiln && (
            <TodayDetailBody empty={false} href="/dashboard/production" locale={locale}>
              <Card className="border-brick/20">
                <CardContent className="space-y-2 pt-4 text-base">
                  <p>
                    {locale === "ur" ? "درجہ حرارت" : "Temperature"}:{" "}
                    <strong>{data.kiln.temperature}°C</strong>
                  </p>
                  <p>
                    {locale === "ur" ? "ایندھن" : "Fuel used"}: <strong>{data.kiln.fuelUsed}</strong>
                  </p>
                  <p>
                    {locale === "ur" ? "سائیکل" : "Cycle"}: <strong>{data.kiln.cycleNumber}</strong>
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {locale === "ur" ? "وقت" : "Recorded"}: {data.kiln.recordedAt}
                  </p>
                </CardContent>
              </Card>
            </TodayDetailBody>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function TodayDetailBody({
  children,
  empty,
  emptyText,
  href,
  locale,
}: {
  children: React.ReactNode;
  empty: boolean;
  emptyText?: string;
  href: string;
  locale: "en" | "ur";
}) {
  return (
    <div className="space-y-4">
      {empty ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-on-surface-variant">{emptyText}</p>
      ) : (
        children
      )}
      <Link href={href}>
        <Button variant="outline" className="w-full">
          {locale === "ur" ? "مکمل صفحہ کھولیں" : "Open full page"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
