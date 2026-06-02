"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/easy/page-header";
import { WriteGuard } from "@/components/crud/write-guard";
import { useApi } from "@/hooks/use-api";
import { useApp } from "@/context/app-context";
import { cn, formatPKR, formatNumber, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Truck,
  Plus,
  Trash2,
  User,
  Package,
  CheckCircle2,
} from "lucide-react";

type PendingOrder = {
  id: string;
  orderNumber: string;
  brickGrade: string;
  quantity: number;
  ratePerBrick: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  status: string;
  orderDate: string;
  remaining: number;
  dispatchedSoFar: number;
  customer: {
    name: string;
    phone: string;
    city: string | null;
    companyName: string | null;
    contactPerson: string | null;
    address: string | null;
  };
};

type Vehicle = {
  id: string;
  registration: string;
  label: string | null;
  driverName: string;
  driverPhone: string | null;
  capacityBricks: number;
};

type TruckLine = {
  key: string;
  vehicleId?: string;
  truckNumber: string;
  driverName: string;
  driverPhone: string;
  bricksLoaded: number;
  challanNo: string;
  biltyNo?: string;
  transporterName?: string;
  freightAmount?: number;
};

export default function NewDispatchPage() {
  const { locale } = useApp();
  const router = useRouter();
  const { request, loading } = useApi();
  const [loadingData, setLoadingData] = useState(true);
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [suggestedChallans, setSuggestedChallans] = useState<string[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [trucks, setTrucks] = useState<TruckLine[]>([]);
  const [notes, setNotes] = useState("");
  const [challanIdx, setChallanIdx] = useState(0);

  const load = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/dispatch/prepare", { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setOrders(json.data.pendingOrders);
      setVehicles(json.data.vehicles);
      setSuggestedChallans(json.data.suggestedChallans ?? []);
      if (json.data.pendingOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(json.data.pendingOrders[0].id);
      }
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const addTruckFromVehicle = (v: Vehicle) => {
    const challan = suggestedChallans[challanIdx + trucks.length] ?? "";
    const suggestBricks = Math.min(
      v.capacityBricks,
      selectedOrder?.remaining ?? v.capacityBricks
    );
    setTrucks((prev) => [
      ...prev,
      {
        key: `v-${v.id}-${Date.now()}`,
        vehicleId: v.id,
        truckNumber: v.registration,
        driverName: v.driverName,
        driverPhone: v.driverPhone ?? "",
        bricksLoaded: suggestBricks,
        challanNo: challan,
      },
    ]);
  };

  const addEmptyTruck = () => {
    setTrucks((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        truckNumber: "",
        driverName: "",
        driverPhone: "",
        bricksLoaded: 0,
        challanNo: suggestedChallans[challanIdx + prev.length] ?? "",
      },
    ]);
  };

  const updateTruck = (key: string, patch: Partial<TruckLine>) => {
    setTrucks((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  };

  const removeTruck = (key: string) => {
    setTrucks((prev) => prev.filter((t) => t.key !== key));
  };

  const totalBricks = trucks.reduce((s, t) => s + (t.bricksLoaded || 0), 0);

  const submit = async () => {
    if (!selectedOrderId || trucks.length === 0) return;
    const res = await request("/api/dispatch/bulk", {
      method: "POST",
      body: JSON.stringify({
        orderId: selectedOrderId,
        trucks: trucks.map(({ key: _k, ...t }) => t),
        notes,
      }),
      successMessage:
        locale === "ur"
          ? `${trucks.length} ٹرک ڈسپیچ ہو گئیں`
          : `${trucks.length} truck(s) dispatched`,
    });
    if (res.success) {
      router.push("/dashboard/dispatch");
    }
  };

  if (loadingData) {
    return (
      <div className="easy-page space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="easy-page space-y-6">
      <Link href="/dashboard/dispatch">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {locale === "ur" ? "ڈسپیچ رجسٹر" : "Dispatch register"}
        </Button>
      </Link>

      <PageHeader
        title="New truck dispatch"
        titleUr="نئی ٹرک ڈسپیچ"
        hint="Select order, pick truck(s), challan auto-generated"
        hintUr="آرڈر منتخب کریں، ٹرک چنیں، چالان خود بنے گا"
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-2">
          <Card className="glass-card border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-primary" />
                {locale === "ur" ? "باقی آرڈر" : "Orders with balance"}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[520px] space-y-2 overflow-y-auto">
              {orders.length === 0 && (
                <p className="text-sm text-on-surface-variant">
                  {locale === "ur" ? "کوئی باقی آرڈر نہیں" : "No pending orders"}
                </p>
              )}
              {orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(o.id);
                    setTrucks([]);
                  }}
                  className={cn(
                    "w-full rounded-xl border-2 p-3 text-left transition",
                    selectedOrderId === o.id
                      ? "border-primary bg-primary-container/30"
                      : "border-outline-variant/30 hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-bold text-primary">{o.orderNumber}</p>
                      <p className="font-semibold">{o.customer.name}</p>
                      {o.customer.companyName && (
                        <p className="text-xs text-on-surface-variant">{o.customer.companyName}</p>
                      )}
                      <p className="text-xs text-on-surface-variant">
                        {o.customer.phone}
                        {o.customer.city && ` · ${o.customer.city}`}
                      </p>
                    </div>
                    <Badge variant="secondary">{o.brickGrade.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <span>
                      {locale === "ur" ? "کل آرڈر" : "Ordered"}:{" "}
                      <strong>{formatNumber(o.quantity)}</strong>
                    </span>
                    <span>
                      {locale === "ur" ? "باقی" : "Remaining"}:{" "}
                      <strong className="text-green-700">{formatNumber(o.remaining)}</strong>
                    </span>
                    <span>
                      {locale === "ur" ? "بھیجا" : "Dispatched"}: {formatNumber(o.dispatchedSoFar)}
                    </span>
                    <span>{formatPKR(o.totalAmount)}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-3">
          {selectedOrder && (
            <Card className="glass-card bg-surface-container/40">
              <CardContent className="p-4">
                <p className="text-sm text-on-surface-variant">
                  {locale === "ur" ? "منتخب آرڈر" : "Selected order"}
                </p>
                <p className="text-lg font-bold">
                  {selectedOrder.orderNumber} — {selectedOrder.customer.name}
                </p>
                <p className="text-sm">
                  {locale === "ur" ? "اس ڈسپیچ میں باقی" : "Remaining to dispatch"}:{" "}
                  <strong className="text-primary">{formatNumber(selectedOrder.remaining)}</strong>{" "}
                  {locale === "ur" ? "اینٹ" : "bricks"}
                  {totalBricks > 0 && (
                    <span className="ml-2">
                      ({locale === "ur" ? "منتخب" : "this load"}: {formatNumber(totalBricks)})
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-5 w-5" />
                {locale === "ur" ? "فلیٹ / ٹرک منتخب کریں" : "Select truck — auto-fill challan"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => addTruckFromVehicle(v)}
                    className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-3 text-left transition hover:border-primary hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-bold">{v.registration}</p>
                      <p className="text-xs text-on-surface-variant">{v.label}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        {v.driverName}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        ~{formatNumber(v.capacityBricks)} {locale === "ur" ? "اینٹ" : "bricks"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={addEmptyTruck}>
                <Plus className="h-4 w-4" />
                {locale === "ur" ? "خالی لائن" : "Add manual truck"}
              </Button>
            </CardContent>
          </Card>

          {trucks.length > 0 && (
            <Card className="glass-card border-2 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {locale === "ur" ? "اس ڈسپیچ کی گاڑیاں" : "Trucks in this dispatch"} ({trucks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trucks.map((t, i) => (
                  <div
                    key={t.key}
                    className="rounded-xl border border-outline-variant/30 bg-surface-container/30 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <Badge>{locale === "ur" ? `ٹرک ${i + 1}` : `Truck ${i + 1}`}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => removeTruck(t.key)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>{locale === "ur" ? "چالان نمبر" : "Challan no (auto)"}</Label>
                        <Input
                          value={t.challanNo}
                          onChange={(e) => updateTruck(t.key, { challanNo: e.target.value })}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label>{locale === "ur" ? "ٹرک نمبر" : "Truck number"}</Label>
                        <Input
                          value={t.truckNumber}
                          onChange={(e) => updateTruck(t.key, { truckNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>{locale === "ur" ? "ڈرائیور" : "Driver"}</Label>
                        <Input
                          value={t.driverName}
                          onChange={(e) => updateTruck(t.key, { driverName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>{locale === "ur" ? "فون" : "Phone"}</Label>
                        <Input
                          value={t.driverPhone}
                          onChange={(e) => updateTruck(t.key, { driverPhone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>{locale === "ur" ? "بلٹی نمبر" : "Bilty no"}</Label>
                        <Input
                          value={t.biltyNo ?? ""}
                          onChange={(e) => updateTruck(t.key, { biltyNo: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>{locale === "ur" ? "ٹرانسپورٹر" : "Transporter"}</Label>
                        <Input
                          value={t.transporterName ?? ""}
                          onChange={(e) =>
                            updateTruck(t.key, { transporterName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>{locale === "ur" ? "کرایہ (PKR)" : "Freight (PKR)"}</Label>
                        <Input
                          type="number"
                          value={t.freightAmount ?? ""}
                          onChange={(e) =>
                            updateTruck(t.key, { freightAmount: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>{locale === "ur" ? "لوڈ کی اینٹیں" : "Bricks loaded"}</Label>
                        <Input
                          type="number"
                          value={t.bricksLoaded || ""}
                          onChange={(e) =>
                            updateTruck(t.key, { bricksLoaded: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <Label>{locale === "ur" ? "نوٹ" : "Notes"}</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <WriteGuard minRole="MANAGER">
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    disabled={
                      loading ||
                      !selectedOrderId ||
                      trucks.some((t) => !t.truckNumber || !t.driverName || !t.bricksLoaded)
                    }
                    onClick={submit}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {locale === "ur"
                      ? `${trucks.length} ٹرک ڈسپیچ کریں`
                      : `Dispatch ${trucks.length} truck(s)`}
                  </Button>
                </WriteGuard>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
