"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/context/app-context";
import { useApi } from "@/hooks/use-api";
import {
  MATERIAL_META,
  type MaterialTypeCode,
  allMaterialTypes,
} from "@/lib/material-types";
import { cn, formatDate } from "@/lib/utils";
import { ChevronRight, History, Plus, Minus, Flame } from "lucide-react";

export type MaterialRow = {
  type: string;
  quantity: number;
  unit: string;
  minStock: number;
  previousStock?: number;
  lastChange?: {
    operation: string;
    changeQty: number;
    recordedAt: string;
    notes?: string | null;
  } | null;
  recentLogs?: {
    id: string;
    previousQty: number;
    newQty: number;
    changeQty: number;
    operation: string;
    notes?: string | null;
    recordedAt: string;
  }[];
};

type Props = {
  materials: MaterialRow[];
  onUpdated: () => void;
};

export function MaterialCardGrid({ materials, onUpdated }: Props) {
  const { locale } = useApp();
  const { request, loading } = useApi();
  const [selected, setSelected] = useState<MaterialTypeCode | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState({
    operation: "add" as "add" | "subtract" | "usage",
    quantity: 0,
    notes: "",
    recordDate: new Date().toISOString().split("T")[0],
  });

  const map = new Map(materials.map((m) => [m.type, m]));
  const metaList = allMaterialTypes();

  const openRecord = (code: MaterialTypeCode) => {
    setSelected(code);
    setForm({
      operation: "add",
      quantity: 0,
      notes: "",
      recordDate: new Date().toISOString().split("T")[0],
    });
    setRecordOpen(true);
  };

  const saveRecord = async () => {
    if (!selected) return;
    const res = await request("/api/materials", {
      method: "POST",
      body: JSON.stringify({
        action: "record",
        type: selected,
        ...form,
      }),
      successMessage: locale === "ur" ? "ریکارڈ محفوظ" : "Record saved",
    });
    if (res.success) {
      setRecordOpen(false);
      onUpdated();
    }
  };

  const mat = selected ? map.get(selected) : null;
  const meta = selected ? MATERIAL_META[selected] : null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
        <Flame className="h-5 w-5 text-emerald-700" />
        {locale === "ur"
          ? "پاکستانی بھٹوں میں زیادہ تر بھٹی لکڑی اور لکڑی کے کچرے سے چلتی ہے — نیچے ایندھن کارڈ دیکھیں"
          : "Most Pakistani bhathas run kilns on firewood & wood waste — see fuel cards below"}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metaList.map((m) => {
          const row = map.get(m.code);
          const qty = row?.quantity ?? 0;
          const prev = row?.previousStock ?? qty;
          const low = row ? qty <= row.minStock : false;
          const Icon = m.icon;

          return (
            <Card
              key={m.code}
              className={cn(
                "glass-card h-full overflow-hidden border-2 transition hover:scale-[1.01]",
                m.border,
                low && "ring-2 ring-amber-400/50"
              )}
            >
              <CardContent className="p-0">
                <div
                  className={cn(
                    "flex items-center gap-3 border-b border-outline-variant/20 bg-gradient-to-br px-4 py-4",
                    m.gradient
                  )}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container/80 shadow-inner">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold leading-tight">
                      {locale === "ur" ? m.nameUr : m.nameEn}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {locale === "ur" ? m.descriptionUr : m.descriptionEn}
                    </p>
                  </div>
                  {m.isKilnFuel && (
                    <Badge className="shrink-0 bg-emerald-600/90 text-white">
                      {locale === "ur" ? "بھٹی ایندھن" : "Kiln fuel"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-on-surface-variant">
                        {locale === "ur" ? "موجودہ اسٹاک" : "Current stock"}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {qty.toLocaleString()}{" "}
                        <span className="text-sm font-normal">{m.unit}</span>
                      </p>
                    </div>
                    {low && (
                      <Badge variant="outline" className="border-amber-500 text-amber-800">
                        {locale === "ur" ? "کم" : "Low"}
                      </Badge>
                    )}
                  </div>

                  <div className="rounded-lg bg-surface-container/50 p-2 text-sm">
                    <p className="text-on-surface-variant">
                      {locale === "ur" ? "پچھلا اسٹاک" : "Previous stock"}:{" "}
                      <strong>{prev.toLocaleString()}</strong> {m.unit}
                    </p>
                    {row?.lastChange && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        {row.lastChange.operation}{" "}
                        {row.lastChange.changeQty >= 0 ? "+" : ""}
                        {row.lastChange.changeQty} · {formatDate(row.lastChange.recordedAt)}
                      </p>
                    )}
                    <p className="text-xs text-on-surface-variant mt-1">
                      {locale === "ur" ? "کم از کم" : "Min"}: {row?.minStock ?? 0} {m.unit}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1" onClick={() => openRecord(m.code)}>
                      <Plus className="h-4 w-4" />
                      {locale === "ur" ? "ریکارڈ" : "Add record"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setSelected(m.code);
                        setForm((f) => ({ ...f, operation: "usage" }));
                        setRecordOpen(true);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                      {locale === "ur" ? "استعمال" : "Usage"}
                    </Button>
                  </div>

                  {row?.recentLogs && row.recentLogs.length > 0 && (
                    <details className="text-xs">
                      <summary className="flex cursor-pointer items-center gap-1 font-medium text-primary">
                        <History className="h-3 w-3" />
                        {locale === "ur" ? "تاریخ" : "History"} ({row.recentLogs.length})
                      </summary>
                      <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-on-surface-variant">
                        {row.recentLogs.map((log) => (
                          <li key={log.id} className="border-b border-outline-variant/20 pb-1">
                            {formatDate(log.recordedAt)} · {log.operation}{" "}
                            {log.changeQty >= 0 ? "+" : ""}
                            {log.changeQty} → {log.newQty.toLocaleString()}
                            {log.notes && ` — ${log.notes}`}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {m.isKilnFuel && (
                    <Link
                      href={
                        m.code === "WOOD" || m.code === "WOOD_WASTE"
                          ? "/dashboard/workers/group/WOOD_FUEL"
                          : m.code === "COAL"
                            ? "/dashboard/workers/group/FUEL_COAL"
                            : "/dashboard/workers"
                      }
                      className="flex items-center text-xs font-medium text-primary"
                    >
                      {locale === "ur" ? "مزدور گروپ کھولیں" : "Open worker group"}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {meta && (locale === "ur" ? meta.nameUr : meta.nameEn)} —{" "}
              {locale === "ur" ? "نیا ریکارڈ" : "New stock record"}
            </DialogTitle>
          </DialogHeader>
          {mat && meta && (
            <div className="space-y-3">
              <p className="rounded-lg bg-muted/50 p-3 text-sm">
                {locale === "ur" ? "پچھلا اسٹاک" : "Previous stock"}:{" "}
                <strong>{mat.previousStock?.toLocaleString() ?? mat.quantity}</strong> {meta.unit}
                {" → "}
                {locale === "ur" ? "موجودہ" : "Current"}:{" "}
                <strong>{mat.quantity.toLocaleString()}</strong>
              </p>
              <div>
                <Label>{locale === "ur" ? "عمل" : "Operation"}</Label>
                <select
                  className="mt-1 w-full rounded-lg border p-2"
                  value={form.operation}
                  onChange={(e) =>
                    setForm({ ...form, operation: e.target.value as typeof form.operation })
                  }
                >
                  <option value="add">{locale === "ur" ? "اسٹاک شامل" : "Stock in (+)"}</option>
                  <option value="subtract">
                    {locale === "ur" ? "اسٹاک کم" : "Stock out (−)"}
                  </option>
                  <option value="usage">
                    {locale === "ur" ? "بھٹی / استعمال" : "Kiln usage"}
                  </option>
                </select>
              </div>
              <div>
                <Label>{locale === "ur" ? "مقدار" : "Quantity"}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.quantity || ""}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>{locale === "ur" ? "تاریخ" : "Date"}</Label>
                <Input
                  type="date"
                  value={form.recordDate}
                  onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
                />
              </div>
              <div>
                <Label>{locale === "ur" ? "نوٹ" : "Notes"}</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={
                    locale === "ur" ? "مثلاً ٹرک نمبر، بھٹی سائیکل" : "e.g. truck no., kiln cycle"
                  }
                />
              </div>
              <Button onClick={saveRecord} disabled={loading || !form.quantity}>
                {locale === "ur" ? "محفوظ کریں" : "Save record"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
