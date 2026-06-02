"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModuleToolbar } from "@/components/crud/module-toolbar";
import { WriteGuard } from "@/components/crud/write-guard";
import { StatsRow } from "@/components/module/stats-row";
import { PageHeader } from "@/components/easy/page-header";
import {
  MaterialCardGrid,
  type MaterialRow,
} from "@/components/materials/material-card-grid";
import { MATERIAL_TYPE_CODES } from "@/lib/material-types";
import { useApi, downloadExport } from "@/hooks/use-api";
import { useApp } from "@/context/app-context";
import { Boxes, AlertTriangle, TreeDeciduous } from "lucide-react";
import { formatPKR } from "@/lib/utils";

type Supplier = { id: string; name: string };

export default function MaterialsPage() {
  const { locale } = useApp();
  const { request, loading } = useApi();
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [purchases, setPurchases] = useState<
    { material: string; quantity: number; totalCost: number; supplier: { name: string }; date: string }[]
  >([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStock, setLowStock] = useState<MaterialRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: "", phone: "", address: "", material: "WOOD" });
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: "",
    material: "WOOD",
    quantity: 0,
    unitPrice: 0,
    notes: "",
  });

  const load = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/materials", { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setMaterials(json.data.materials);
      setPurchases(
        json.data.purchases.map((p: { quantity: string; totalCost: string }) => ({
          ...p,
          quantity: Number(p.quantity),
          totalCost: Number(p.totalCost),
        }))
      );
      setSuppliers(json.data.suppliers);
      setLowStock(json.data.lowStock);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSupplier = async () => {
    const res = await request("/api/materials", {
      method: "POST",
      body: JSON.stringify({ action: "supplier", ...supplierForm }),
      successMessage: locale === "ur" ? "سپلائر شامل" : "Supplier added",
    });
    if (res.success) {
      setSupplierOpen(false);
      load();
    }
  };

  const savePurchase = async () => {
    const res = await request("/api/materials", {
      method: "POST",
      body: JSON.stringify({ action: "purchase", ...purchaseForm }),
      successMessage: locale === "ur" ? "خریداری محفوظ" : "Purchase recorded",
    });
    if (res.success) {
      setPurchaseOpen(false);
      load();
    }
  };

  const woodStock =
    (materials.find((m) => m.type === "WOOD")?.quantity ?? 0) +
    (materials.find((m) => m.type === "WOOD_WASTE")?.quantity ?? 0);

  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Raw Materials"
        titleUr="خام مال"
        hint="Card view — current stock, previous stock, add usage or stock-in records"
        hintUr="کارڈ — موجودہ و پچھلا اسٹاک، نیا ریکارڈ شامل کریں"
      />

      {lowStock.length > 0 && (
        <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-2 p-4 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {locale === "ur" ? "کم اسٹاک: " : "Low stock: "}
            {lowStock.map((m) => m.type).join(", ")}
          </CardContent>
        </Card>
      )}

      <StatsRow
        items={[
          { label: locale === "ur" ? "اقسام" : "Material types", value: String(materials.length), icon: Boxes },
          {
            label: locale === "ur" ? "لکڑی + کچرا" : "Wood + waste (tons)",
            value: woodStock.toLocaleString(),
            icon: TreeDeciduous,
            color: "bg-emerald-500/20 text-emerald-800",
          },
          {
            label: locale === "ur" ? "کم اسٹاک" : "Low stock",
            value: String(lowStock.length),
            icon: AlertTriangle,
            color: "bg-amber-500/20 text-amber-800",
          },
          { label: locale === "ur" ? "سپلائر" : "Suppliers", value: String(suppliers.length), icon: Boxes },
        ]}
      />

      <ModuleToolbar
        search=""
        onSearchChange={() => {}}
        onAdd={() => {}}
        onExport={() => downloadExport("inventory", "xlsx")}
        addLabel=""
        minRole="SUPERVISOR"
      >
        <WriteGuard minRole="SUPERVISOR">
          <Button size="sm" variant="outline" onClick={() => setSupplierOpen(true)}>
            {locale === "ur" ? "سپلائر" : "Add supplier"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPurchaseOpen(true)}>
            {locale === "ur" ? "خریداری" : "Record purchase"}
          </Button>
        </WriteGuard>
      </ModuleToolbar>

      {loadingData ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <MaterialCardGrid materials={materials} onUpdated={load} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">
              {locale === "ur" ? "حالیہ خریداریاں" : "Recent purchases"}
            </h3>
            <div className="space-y-2 text-sm">
              {purchases.length === 0 && (
                <p className="text-on-surface-variant">
                  {locale === "ur" ? "کوئی خریداری نہیں" : "No purchases yet"}
                </p>
              )}
              {purchases.map((p, i) => (
                <div key={i} className="flex justify-between border-b border-outline-variant/20 pb-2">
                  <span>
                    {p.material} — {p.supplier.name}
                  </span>
                  <span>{formatPKR(p.totalCost)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "ur" ? "سپلائر" : "Add supplier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{locale === "ur" ? "نام" : "Name"}</Label>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
            </div>
            <div>
              <Label>{locale === "ur" ? "فون" : "Phone"}</Label>
              <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
            </div>
            <div>
              <Label>{locale === "ur" ? "مال" : "Material"}</Label>
              <select
                className="w-full rounded-lg border p-2"
                value={supplierForm.material}
                onChange={(e) => setSupplierForm({ ...supplierForm, material: e.target.value })}
              >
                {MATERIAL_TYPE_CODES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={saveSupplier} disabled={loading}>
              {locale === "ur" ? "محفوظ" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "ur" ? "خریداری" : "Record purchase"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{locale === "ur" ? "سپلائر" : "Supplier"}</Label>
              <select
                className="w-full rounded-lg border p-2"
                value={purchaseForm.supplierId}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
              >
                <option value="">{locale === "ur" ? "منتخب..." : "Select..."}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === "ur" ? "مال" : "Material"}</Label>
              <select
                className="w-full rounded-lg border p-2"
                value={purchaseForm.material}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, material: e.target.value })}
              >
                {MATERIAL_TYPE_CODES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{locale === "ur" ? "مقدار" : "Quantity"}</Label>
              <Input
                type="number"
                value={purchaseForm.quantity || ""}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>{locale === "ur" ? "قیمت" : "Unit price"}</Label>
              <Input
                type="number"
                value={purchaseForm.unitPrice || ""}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, unitPrice: Number(e.target.value) })}
              />
            </div>
            <Button onClick={savePurchase} disabled={loading}>
              {locale === "ur" ? "محفوظ" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
