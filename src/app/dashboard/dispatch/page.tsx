"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { WriteGuard } from "@/components/crud/write-guard";
import { PageHeader } from "@/components/easy/page-header";
import { StatsRow } from "@/components/module/stats-row";
import { useApi } from "@/hooks/use-api";
import { useApp } from "@/context/app-context";
import { Truck, Trash2, Printer, Plus } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

type DispatchRow = {
  id: string;
  challanNo: string;
  truckNumber: string;
  driverName: string;
  driverPhone: string | null;
  bricksLoaded: number;
  dispatchDate: string;
  order: {
    orderNumber: string;
    customer: { name: string; city: string | null; phone: string; companyName: string | null };
  };
  vehicle?: { registration: string; label: string | null } | null;
};

export default function DispatchPage() {
  const { locale } = useApp();
  const { request, loading } = useApi();
  const [dispatches, setDispatches] = useState<DispatchRow[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<DispatchRow | null>(null);

  const load = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/dispatch", { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setDispatches(json.data.dispatches);
      setTodayCount(json.data.todayCount);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async () => {
    if (!selected) return;
    const res = await request(`/api/dispatch/${selected.id}`, {
      method: "DELETE",
      successMessage: locale === "ur" ? "حذف ہو گیا" : "Deleted",
    });
    if (res.success) {
      setDeleteOpen(false);
      setSelected(null);
      load();
    }
  };

  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Truck Dispatch"
        titleUr="ٹرک ڈسپیچ"
        hint="Challan register — create multi-truck dispatch from new page"
        hintUr="چالان رجسٹر — نئی ڈسپیچ سے کئی ٹرک"
      />

      <StatsRow
        items={[
          { label: locale === "ur" ? "آج" : "Today", value: String(todayCount), icon: Truck },
          { label: locale === "ur" ? "کل" : "Total", value: String(dispatches.length), icon: Truck },
          {
            label: locale === "ur" ? "اینٹ لوڈ" : "Bricks loaded",
            value: formatNumber(dispatches.reduce((s, d) => s + d.bricksLoaded, 0)),
            icon: Truck,
          },
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/dispatch/new">
          <Button size="lg" className="gap-2 shadow-md">
            <Plus className="h-5 w-5" />
            {locale === "ur" ? "نئی ڈسپیچ" : "New dispatch"}
          </Button>
        </Link>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{locale === "ur" ? "ڈسپیچ رجسٹر" : "Dispatch register"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-premium w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2">{locale === "ur" ? "چالان" : "Challan"}</th>
                    <th>{locale === "ur" ? "کسٹمر" : "Customer"}</th>
                    <th>{locale === "ur" ? "آرڈر" : "Order"}</th>
                    <th>{locale === "ur" ? "ٹرک" : "Truck"}</th>
                    <th>{locale === "ur" ? "ڈرائیور" : "Driver"}</th>
                    <th>{locale === "ur" ? "اینٹ" : "Bricks"}</th>
                    <th>{locale === "ur" ? "تاریخ" : "Date"}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map((d) => (
                    <tr key={d.id} className="border-b border-outline-variant/10">
                      <td className="py-2 font-mono font-medium text-primary">{d.challanNo}</td>
                      <td>
                        <p className="font-medium">{d.order.customer.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {d.order.customer.phone}
                          {d.order.customer.city && ` · ${d.order.customer.city}`}
                        </p>
                      </td>
                      <td className="font-mono text-xs">{d.order.orderNumber}</td>
                      <td>
                        {d.truckNumber}
                        {d.vehicle?.label && (
                          <p className="text-xs text-on-surface-variant">{d.vehicle.label}</p>
                        )}
                      </td>
                      <td>{d.driverName}</td>
                      <td>{formatNumber(d.bricksLoaded)}</td>
                      <td>{formatDate(d.dispatchDate)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Link href={`/dashboard/dispatch/${d.id}/challan`} target="_blank">
                            <Button size="icon" variant="ghost" title="Print challan">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </Link>
                          <WriteGuard minRole="SUPERVISOR">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelected(d);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </WriteGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={locale === "ur" ? "ڈسپیچ حذف؟" : "Delete dispatch?"}
        description={`${selected?.challanNo}`}
        onConfirm={onDelete}
        loading={loading}
      />
    </div>
  );
}
