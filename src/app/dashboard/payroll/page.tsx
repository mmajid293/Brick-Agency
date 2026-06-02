"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModuleToolbar } from "@/components/crud/module-toolbar";
import { WriteGuard } from "@/components/crud/write-guard";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { StatsRow } from "@/components/module/stats-row";
import { useApi } from "@/hooks/use-api";
import { Wallet, Check, Trash2 } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { AutoPayrollPanel } from "@/components/payroll/auto-payroll-panel";

type PayrollRow = {
  id: string;
  month: number;
  year: number;
  netPay: number;
  isPaid: boolean;
  worker: { name: string; department: string };
}; 

type WorkerOpt = { id: string; name: string; dailyWage: number };

export default function PayrollPage() {
  const { request, loading } = useApi();
  const [payrolls, setPayrolls] = useState<PayrollRow[]>([]);
  const [workers, setWorkers] = useState<WorkerOpt[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<PayrollRow | null>(null);
  const [filterPaid, setFilterPaid] = useState("all");
  const [form, setForm] = useState({
    workerId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: 0,
    brickBonus: 0,
    overtimePay: 0,
    deductions: 0,
  });

  const load = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch("/api/payroll", { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setPayrolls(json.data.payrolls.map((p: PayrollRow & { netPay: string }) => ({ ...p, netPay: Number(p.netPay) })));
      setWorkers(json.data.workers);
      setTotalPending(json.data.totalPending);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const res = await request("/api/payroll", { method: "POST", body: JSON.stringify(form), successMessage: "Payroll created" });
    if (res.success) { setDialogOpen(false); load(); }
  };

  const markPaid = async (id: string) => {
    await request(`/api/payroll/${id}`, { method: "PATCH", body: JSON.stringify({ isPaid: true }), successMessage: "Marked paid" });
    load();
  };

  const onDelete = async () => {
    if (!selected) return;
    const res = await request(`/api/payroll/${selected.id}`, { method: "DELETE", successMessage: "Deleted" });
    if (res.success) { setDeleteOpen(false); load(); }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const filtered = payrolls.filter((p) => filterPaid === "all" || (filterPaid === "paid" ? p.isPaid : !p.isPaid));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payroll & Wages</h1>
        <p className="text-muted-foreground">
          Monthly pay from attendance & piece-rate — or enter manually
        </p>
      </div>
      <AutoPayrollPanel onGenerated={load} />
      <StatsRow items={[
        { label: "Workers", value: String(workers.length), icon: Wallet },
        { label: "Records", value: String(payrolls.length), icon: Wallet },
        { label: "Pending", value: formatPKR(totalPending), icon: Wallet },
      ]} />
      <ModuleToolbar search="" onSearchChange={() => {}} onAdd={() => setDialogOpen(true)} addLabel="Generate Payroll" minRole="ACCOUNTANT">
        <select className="rounded border p-2 text-sm" value={filterPaid} onChange={(e) => setFilterPaid(e.target.value)}>
          <option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid</option>
        </select>
      </ModuleToolbar>
      <Card className="glass-card">
        <CardHeader><CardTitle>Payroll Records</CardTitle></CardHeader>
        <CardContent>
          {loadingData ? <Skeleton className="h-48" /> : (
            <table className="table-premium w-full text-sm">
              <thead><tr className="border-b text-left"><th>Worker</th><th>Period</th><th>Net Pay</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-brick/5">
                    <td className="py-2">{p.worker.name}</td>
                    <td>{monthNames[p.month - 1]} {p.year}</td>
                    <td>{formatPKR(p.netPay)}</td>
                    <td><Badge variant={p.isPaid ? "default" : "outline"}>{p.isPaid ? "Paid" : "Pending"}</Badge></td>
                    <td className="py-2">
                      <WriteGuard minRole="ACCOUNTANT">
                        <div className="flex gap-1">
                          {!p.isPaid && <Button size="icon" variant="ghost" onClick={() => markPaid(p.id)}><Check className="h-4 w-4 text-green-600" /></Button>}
                          <Button size="icon" variant="ghost" onClick={() => { setSelected(p); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </WriteGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Payroll</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Worker</Label>
              <select className="w-full rounded border p-2" value={form.workerId} onChange={(e) => {
                const w = workers.find((x) => x.id === e.target.value);
                setForm({ ...form, workerId: e.target.value, baseSalary: w ? w.dailyWage * 26 : 0 });
              }}>
                <option value="">Select...</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Month</Label><Input type="number" min={1} max={12} value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} /></div>
              <div><Label>Year</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Base Salary</Label><Input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })} /></div>
            <div><Label>Deductions</Label><Input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })} /></div>
            <Button onClick={save} disabled={loading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete payroll?" description="Remove this record?" onConfirm={onDelete} loading={loading} />
    </div>
  );
}
