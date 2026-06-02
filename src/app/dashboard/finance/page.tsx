"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModuleToolbar } from "@/components/crud/module-toolbar";
import { WriteGuard } from "@/components/crud/write-guard";
import { StatsRow } from "@/components/module/stats-row";
import { BarChart3, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { formatPKR, formatDate } from "@/lib/utils";
import { useApi, downloadExport } from "@/hooks/use-api";

export default function FinancePage() {
  const { request, loading } = useApi();
  const [transactions, setTransactions] = useState<{ id: string; type: string; amount: number; description: string; date: string }[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenseTotal: 0, net: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "INCOME", amount: 0, description: "", category: "Sales" });
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: 0, category: "Operations", notes: "" });

  const load = useCallback(() => {
    setLoadingData(true);
    fetch("/api/finance", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setTransactions(
            res.data.transactions.map((t: { id: string; type: string; amount: string; description: string; date: string }) => ({
              ...t,
              amount: Number(t.amount),
            }))
          );
          setSummary(res.data.summary);
        }
      })
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveTransaction = async () => {
    const res = await request("/api/finance", {
      method: "POST",
      body: JSON.stringify(form),
      successMessage: "Transaction saved",
    });
    if (res.success) {
      setDialogOpen(false);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <p className="text-muted-foreground">PKR ledger, expenses, profit/loss</p>
      </div>
      <StatsRow
        items={[
          { label: "Income", value: formatPKR(summary.income), icon: BarChart3, color: "bg-green-500/20 text-green-700" },
          { label: "Expenses", value: formatPKR(summary.expenseTotal), icon: BarChart3 },
          { label: "Net P/L", value: formatPKR(summary.net), icon: BarChart3, color: summary.net >= 0 ? "bg-green-500/20" : "bg-red-500/20" },
        ]}
      />

      <ModuleToolbar search="" onSearchChange={() => {}} onAdd={() => setDialogOpen(true)} onExport={() => downloadExport("finance", "pdf")} addLabel="Add Transaction" minRole="ACCOUNTANT">
        <WriteGuard minRole="ACCOUNTANT">
          <Button size="sm" variant="outline" onClick={() => setExpenseOpen(true)}>Add Expense</Button>
        </WriteGuard>
      </ModuleToolbar>

      <Card>
        <CardHeader><CardTitle>Transaction Ledger</CardTitle></CardHeader>
        <CardContent>
          {loadingData ? <Skeleton className="h-48" /> : (
            <table className="table-premium w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-brick/5">
                    <td className="py-2">{formatDate(t.date)}</td>
                    <td className="py-2">{t.type}</td>
                    <td className="py-2">{t.description}</td>
                    <td className={`py-2 text-right font-medium ${t.type === "INCOME" || t.type === "CUSTOMER_PAYMENT" ? "text-green-700" : "text-red-700"}`}>
                      {formatPKR(t.amount)}
                    </td>
                    <td className="py-2">
                      <WriteGuard minRole="ACCOUNTANT">
                        <Button size="icon" variant="ghost" onClick={() => { setSelectedId(t.id); setDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
          <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <select className="w-full rounded border p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="CUSTOMER_PAYMENT">Customer Payment</option>
                <option value="SALARY">Salary</option>
              </select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Amount (PKR)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <Button onClick={saveTransaction} disabled={loading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} /></div>
            <div><Label>Amount</Label><Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} /></div>
            <div><Label>Category</Label><Input value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} /></div>
            <Button onClick={async () => {
              const res = await request("/api/finance", { method: "POST", body: JSON.stringify({ kind: "expense", ...expenseForm }), successMessage: "Expense saved" });
              if (res.success) { setExpenseOpen(false); load(); }
            }} disabled={loading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete entry?" description="Remove this ledger entry?" onConfirm={async () => {
        if (!selectedId) return;
        const res = await request(`/api/finance/${selectedId}`, { method: "DELETE", successMessage: "Deleted" });
        if (res.success) { setDeleteOpen(false); load(); }
      }} loading={loading} />
    </div>
  );
}
