"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryUpdateSchema } from "@/lib/validations";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModuleToolbar } from "@/components/crud/module-toolbar";
import { StatsRow } from "@/components/module/stats-row";
import { useApi, downloadExport } from "@/hooks/use-api";
import { formatNumber, formatDate } from "@/lib/utils";
import { Package } from "lucide-react";

const GRADE_LABELS: Record<string, string> = {
  RAW: "Raw Bricks",
  COOKED: "Cooked",
  BROKEN: "Broken / Wastage",
  GRADE_A: "A-Grade",
  GRADE_B: "B-Grade",
};

type FormValues = z.infer<typeof inventoryUpdateSchema>;

export default function InventoryPage() {
  const { request, loading } = useApi();
  const [inventory, setInventory] = useState<{ grade: string; quantity: number }[]>([]);
  const [movements, setMovements] = useState<{ grade: string; quantity: number; type: string; date: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: { grade: "GRADE_A", quantity: 1000, type: "STOCK_IN" as const, fromGrade: undefined, toGrade: undefined },
  });
  const watchType = form.watch("type");

  const load = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/inventory", { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setInventory(json.data.inventory);
      setMovements(json.data.movements || []);
      setTotal(json.data.total);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await request("/api/inventory", {
      method: "POST",
      body: JSON.stringify(values),
      successMessage: "Stock updated",
    });
    if (res.success) {
      setDialogOpen(false);
      load();
    }
  });

  const maxQty = Math.max(...inventory.map((i) => i.quantity), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brick Inventory</h1>
        <p className="text-muted-foreground">Stock in/out, transfers, wastage — live database</p>
      </div>

      <StatsRow
        items={[
          { label: "Total Stock", value: formatNumber(total), icon: Package },
          { label: "Grades", value: String(inventory.length), icon: Package },
          { label: "A-Grade", value: formatNumber(inventory.find((i) => i.grade === "GRADE_A")?.quantity || 0), icon: Package },
          { label: "Wastage", value: formatNumber(inventory.find((i) => i.grade === "BROKEN")?.quantity || 0), icon: Package },
        ]}
      />

      <ModuleToolbar
        search=""
        onSearchChange={() => {}}
        onAdd={() => setDialogOpen(true)}
        onExport={() => downloadExport("finance", "xlsx")}
        addLabel="Update Stock"
        placeholder="Search..."
        minRole="SUPERVISOR"
      />

      {loadingData ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {inventory.map((item) => (
            <Card key={item.grade} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{GRADE_LABELS[item.grade] || item.grade}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-brick">{formatNumber(item.quantity)}</p>
                <p className="text-xs text-muted-foreground mb-2">bricks</p>
                <Progress value={(item.quantity / maxQty) * 100} className="h-2" />
                {item.quantity < 5000 && item.grade !== "RAW" && (
                  <p className="mt-2 text-xs text-amber-600">Low stock alert</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="glass-card">
        <CardHeader><CardTitle>Recent Movements</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {movements.map((m) => (
            <p key={`${m.grade}-${m.date}-${m.type}`}>
              {formatDate(m.date)} — {m.type} — {GRADE_LABELS[m.grade]}: {formatNumber(m.quantity)}
            </p>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Inventory</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label>Grade</Label>
              <select className="w-full rounded border p-2" {...form.register("grade")}>
                {Object.keys(GRADE_LABELS).map((g) => (
                  <option key={g} value={g}>{GRADE_LABELS[g]}</option>
                ))}
              </select>
            </div>
            <div><Label>Quantity</Label><Input type="number" {...form.register("quantity", { valueAsNumber: true })} /></div>
            <div>
              <Label>Type</Label>
              <select className="w-full rounded border p-2" {...form.register("type")}>
                <option value="STOCK_IN">Stock In</option>
                <option value="STOCK_OUT">Stock Out</option>
                <option value="PRODUCTION">Production</option>
                <option value="WASTAGE">Wastage</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            {watchType === "TRANSFER" && (
              <>
                <div><Label>From Grade</Label>
                  <select className="w-full rounded border p-2" {...form.register("fromGrade")}>
                    {Object.keys(GRADE_LABELS).map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
                  </select>
                </div>
                <div><Label>To Grade</Label>
                  <select className="w-full rounded border p-2" {...form.register("toGrade")}>
                    {Object.keys(GRADE_LABELS).map((g) => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
                  </select>
                </div>
              </>
            )}
            <Button type="submit" disabled={loading}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
