"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
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
import { Pagination } from "@/components/crud/pagination";
import { PageHeader } from "@/components/easy/page-header";
import { HelpTip } from "@/components/easy/help-tip";
import { StatsRow } from "@/components/module/stats-row";
import { useApp } from "@/context/app-context";
import { customerSchema, orderSchema } from "@/lib/validations";
import { useApi, downloadExport } from "@/hooks/use-api";
import { useHighlight } from "@/hooks/use-highlight";
import { formatPKR, formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOMER_TYPES, customerTypeLabel } from "@/lib/customer-types";
import { ShoppingCart, Pencil, Trash2, BookOpen, Wallet } from "lucide-react";

function CustomersContent() {
  const { translate, locale } = useApp();
  const { request, loading } = useApi();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<
    {
      id: string;
      name: string;
      phone: string;
      city: string | null;
      balance: number;
      companyName?: string;
      customerType?: string;
      contactPerson?: string | null;
      notes?: string | null;
      _count: { orders: number };
    }[]
  >([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [orders, setOrders] = useState<
    { orderNumber: string; quantity: number; totalAmount: number; status: string; paymentStatus: string; customer: { name: string }; orderDate: string }[]
  >([]);
  const [pendingDues, setPendingDues] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string } | null>(null);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [ledger, setLedger] = useState<{ orders: unknown[]; payments: unknown[]; balance: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const highlightId = useHighlight("customer-", [customers, loadingData]);

  const form = useForm({ resolver: zodResolver(customerSchema) });
  const orderForm = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { brickGrade: "GRADE_A", quantity: 1000, ratePerBrick: 18 },
  });

  const openLedger = useCallback(async (c: { id: string; name: string }) => {
    setSelected(c);
    const res = await fetch(`/api/customers/${c.id}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setLedger({ orders: json.data.orders, payments: json.data.payments, balance: Number(json.data.balance) });
      setLedgerOpen(true);
    }
  }, []);

  const load = useCallback(async () => {
    setLoadingData(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "15");
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("status", typeFilter);
    const res = await fetch(`/api/customers?${params}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setCustomers(json.data.customers.map((c: { balance: string }) => ({ ...c, balance: Number(c.balance) })));
      setOrders(json.data.orders);
      setPendingDues(json.data.pendingDues);
      if (json.data.meta) setMeta(json.data.meta);
    }
    setLoadingData(false);
  }, [search, page, typeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const ledgerParam = searchParams.get("ledger");
    const highlight = searchParams.get("highlight");
    if (ledgerParam === "1" && highlight && customers.length > 0) {
      const c = customers.find((x) => x.id === highlight);
      if (c) openLedger(c);
    }
  }, [searchParams, customers, openLedger]);

  const onSubmit = form.handleSubmit(async (values) => {
    const url = editing ? `/api/customers/${editing.id}` : "/api/customers";
    const res = await request(url, { method: editing ? "PATCH" : "POST", body: JSON.stringify(values), successMessage: editing ? "Updated" : "Added" });
    if (res.success) { setDialogOpen(false); load(); }
  });

  const onOrder = orderForm.handleSubmit(async (values) => {
    const res = await request("/api/orders", { method: "POST", body: JSON.stringify(values), successMessage: "Order created" });
    if (res.success) { setOrderOpen(false); load(); }
  });

  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Customers"
        titleUr="گاہک"
        hint={translate("customersHelp")}
        hintUr={translate("customersHelp")}
      />
      <HelpTip childrenUr="بٹوا آئیکن = ادائیگی وصول کریں۔ کتاب آئیکن = کھاتہ دیکھیں۔">
        Wallet icon = receive payment. Book icon = view ledger.
      </HelpTip>
      <StatsRow items={[
        { label: "Customers", value: String(meta.total || customers.length), icon: ShoppingCart },
        { label: "Open Orders", value: String(orders.filter((o) => o.status !== "DELIVERED").length), icon: ShoppingCart },
        { label: "Pending Dues", value: formatPKR(pendingDues), icon: ShoppingCart },
      ]} />
      <ModuleToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onAdd={() => {
          setEditing(null);
          form.reset({ name: "", phone: "", customerType: "BUILDER" });
          setDialogOpen(true);
        }}
        onExport={() => downloadExport("finance", "xlsx")}
        addLabel="Add Customer / گاہک شامل"
        minRole="MANAGER"
      >
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "ur" ? "سب" : "All types"}</SelectItem>
            {CUSTOMER_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {locale === "ur" ? t.labelUr : t.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <WriteGuard minRole="MANAGER">
          <Button size="sm" variant="outline" onClick={() => setOrderOpen(true)}>New Order</Button>
        </WriteGuard>
      </ModuleToolbar>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader><CardTitle>Customers</CardTitle></CardHeader>
          <CardContent>
            {loadingData ? <Skeleton className="h-32" /> : customers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers found.</p>
            ) : customers.map((c) => (
              <div
                key={c.id}
                id={`customer-${c.id}`}
                className={`flex justify-between border-b border-brick/5 py-2 text-sm items-center rounded-md px-1 ${highlightId === c.id ? "bg-primary/5" : ""}`}
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.companyName && <p className="text-xs opacity-80">{c.companyName}</p>}
                  <p className="text-xs opacity-70">
                    {c.customerType && (
                      <span className="mr-1 font-medium text-primary">
                        {customerTypeLabel(c.customerType, locale === "ur" ? "ur" : "en")} ·
                      </span>
                    )}
                    {c.phone} · Due {formatPKR(c.balance)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openLedger(c)} title="Ledger"><BookOpen className="h-4 w-4" /></Button>
                  <WriteGuard minRole="MANAGER">
                    <Button size="icon" variant="ghost" onClick={() => { setSelected(c); setPaymentOpen(true); }} title="Payment"><Wallet className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditing(c);
                      form.reset({
                        name: c.name,
                        phone: c.phone,
                        companyName: c.companyName,
                        city: c.city ?? undefined,
                        customerType: (c.customerType as "BUILDER") || "BUILDER",
                        contactPerson: c.contactPerson ?? "",
                        notes: c.notes ?? "",
                      });
                      setDialogOpen(true);
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { setSelected(c); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </WriteGuard>
                </div>
              </div>
            ))}
            <Pagination page={page} totalPages={meta.totalPages} total={meta.total} onPageChange={setPage} />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {loadingData ? <Skeleton className="h-32" /> : orders.map((o) => (
              <div key={o.orderNumber} className="border-b border-brick/5 py-2 text-sm">
                <div className="flex justify-between"><span className="font-medium">{o.orderNumber}</span><Badge>{o.status}</Badge></div>
                <p>{o.customer.name} — {formatPKR(Number(o.totalAmount))}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Customer</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div><Label>Name</Label><Input {...form.register("name")} /></div>
            <div><Label>Phone</Label><Input {...form.register("phone")} /></div>
            <div>
              <Label>{locale === "ur" ? "قسم" : "Customer type"}</Label>
              <Select
                value={form.watch("customerType") || "BUILDER"}
                onValueChange={(v) => form.setValue("customerType", v as "BUILDER")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {locale === "ur" ? t.labelUr : t.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{locale === "ur" ? "رابطہ" : "Contact"}</Label><Input {...form.register("contactPerson")} /></div>
            <div><Label>Company</Label><Input {...form.register("companyName")} /></div>
            <div><Label>City</Label><Input {...form.register("city")} /></div>
            <div><Label>{locale === "ur" ? "نوٹ" : "Notes"}</Label><Input {...form.register("notes")} /></div>
            <Button type="submit" disabled={loading}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
          <form onSubmit={onOrder} className="space-y-3">
            <div><Label>Customer</Label>
              <select className="w-full rounded border p-2" {...orderForm.register("customerId")}>
                <option value="">Select...</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><Label>Quantity</Label><Input type="number" {...orderForm.register("quantity", { valueAsNumber: true })} /></div>
            <div><Label>Rate / brick</Label><Input type="number" step="0.01" {...orderForm.register("ratePerBrick", { valueAsNumber: true })} /></div>
            <Button type="submit" disabled={loading}>Create</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ledger — {selected?.name}</DialogTitle></DialogHeader>
          {ledger && (
            <div className="space-y-3 text-sm">
              <p className="font-bold text-brick">Balance due: {formatPKR(ledger.balance)}</p>
              <h4 className="font-semibold">Orders</h4>
              {(ledger.orders as { orderNumber: string; totalAmount: number; status: string }[]).map((o) => (
                <p key={o.orderNumber}>{o.orderNumber} — {formatPKR(Number(o.totalAmount))} — {o.status}</p>
              ))}
              <h4 className="font-semibold">Payments</h4>
              {(ledger.payments as { description: string; amount: number; date: string }[]).map((p, i) => (
                <p key={i}>{formatDate(p.date)} — {p.description} — {formatPKR(Number(p.amount))}</p>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Amount</Label><Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} /></div>
            <Button onClick={async () => {
              if (!selected) return;
              const res = await request(`/api/customers/${selected.id}/payments`, { method: "POST", body: JSON.stringify({ amount: paymentAmount }), successMessage: "Payment recorded" });
              if (res.success) { setPaymentOpen(false); load(); }
            }} disabled={loading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete customer?" description={`Remove ${selected?.name}?`} onConfirm={async () => {
        if (!selected) return;
        const res = await request(`/api/customers/${selected.id}`, { method: "DELETE", successMessage: "Deleted" });
        if (res.success) { setDeleteOpen(false); load(); }
      }} loading={loading} />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-48 w-full" /></div>}>
      <CustomersContent />
    </Suspense>
  );
}
