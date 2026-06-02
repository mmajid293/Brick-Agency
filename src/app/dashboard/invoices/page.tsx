"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/easy/page-header";
import { formatPKR, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<
    {
      id: string;
      invoiceNumber: string;
      amount: string;
      issuedAt: string;
      order: { orderNumber: string; customer: { name: string } };
    }[]
  >([]);
  const [orderId, setOrderId] = useState("");
  const [ntn, setNtn] = useState("");

  const load = useCallback(() => {
    fetch("/api/invoices", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setInvoices(res.data);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/invoices", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, ntn: ntn || undefined }),
    });
    const json = await res.json();
    if (json.success) {
      setOrderId("");
      load();
    } else alert(json.error ?? "Failed");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tax Invoices" titleUr="ٹیکس انوائس" />
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          <form onSubmit={createInvoice} className="contents">
            <div className="space-y-1 sm:col-span-2">
              <Label>Order ID (from customer orders)</Label>
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>NTN (optional)</Label>
              <Input value={ntn} onChange={(e) => setNtn(e.target.value)} />
            </div>
            <Button type="submit" className="sm:col-span-3 w-fit">
              Issue invoice
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b">
                  <td className="px-4 py-3 font-mono">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">{inv.order.orderNumber}</td>
                  <td className="px-4 py-3">{inv.order.customer.name}</td>
                  <td className="px-4 py-3 text-right">{formatPKR(Number(inv.amount))}</td>
                  <td className="px-4 py-3">{formatDate(inv.issuedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
