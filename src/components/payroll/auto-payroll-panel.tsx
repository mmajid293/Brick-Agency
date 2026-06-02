"use client";

import { Fragment, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WriteGuard } from "@/components/crud/write-guard";
import { useApp } from "@/context/app-context";
import { formatPKR } from "@/lib/utils";
import { wageTypeLabel } from "@/lib/worker-categories";
import type { WageType } from "@prisma/client";
import { Calculator, Loader2, Sparkles } from "lucide-react";
import type { PayrollCalculation } from "@/lib/payroll-calc";

type Props = {
  onGenerated: () => void;
};

export function AutoPayrollPanel({ onGenerated }: Props) {
  const { locale } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [deductAdvance, setDeductAdvance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    calculations: PayrollCalculation[];
    totals: { gross: number; net: number; deductions: number };
  } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function runPreview() {
    setLoading(true);
    const res = await fetch(`/api/payroll/auto?month=${month}&year=${year}`, {
      credentials: "include",
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setPreview({ calculations: json.data.calculations, totals: json.data.totals });
    } else {
      alert(json.error ?? "Preview failed");
    }
  }

  async function runGenerate() {
    if (
      !confirm(
        locale === "ur"
          ? `تمام فعال مزدوروں کی ${month}/${year} تنخواہ بنائیں؟`
          : `Generate payroll for all active workers (${month}/${year})?`
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch("/api/payroll/auto", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        deductAdvance,
        skipPaid: true,
        skipEmpty: false,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setPreview({ calculations: json.data.calculations, totals: json.data.calculations.reduce(
        (acc: { gross: number; net: number; deductions: number }, c: PayrollCalculation) => ({
          gross: acc.gross + c.grossPay,
          net: acc.net + c.netPay,
          deductions: acc.deductions + c.deductions,
        }),
        { gross: 0, net: 0, deductions: 0 }
      ) });
      onGenerated();
      alert(
        locale === "ur"
          ? `${json.data.generated} ریکارڈز محفوظ`
          : `Saved ${json.data.generated} payroll record(s)`
      );
    } else {
      alert(json.error ?? "Generate failed");
    }
  }

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          {locale === "ur" ? "خودکار تنخواہ" : "Auto payroll"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {locale === "ur"
            ? "حاضری، اینٹ پیس ریٹ، ٹرک لوڈ اور اوور ٹائم سے حساب"
            : "From attendance, piece-rate bricks, truck trips & overtime"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label>{locale === "ur" ? "مہینہ" : "Month"}</Label>
            <select
              className="mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{locale === "ur" ? "سال" : "Year"}</Label>
            <Input
              type="number"
              className="mt-1 w-28"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={deductAdvance}
              onChange={(e) => setDeductAdvance(e.target.checked)}
            />
            {locale === "ur" ? "پیشگی کٹوتی" : "Deduct advance (peshgi)"}
          </label>
          <WriteGuard minRole="ACCOUNTANT">
            <Button variant="outline" onClick={runPreview} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              {locale === "ur" ? "پیش نظارہ" : "Preview"}
            </Button>
            <Button onClick={runGenerate} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {locale === "ur" ? "سب کی تنخواہ بنائیں" : "Generate all"}
            </Button>
          </WriteGuard>
        </div>

        {preview && (
          <div className="space-y-2 rounded-xl border bg-background/80 p-3">
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <span>
                {locale === "ur" ? "کل نٹ" : "Total net"}: {formatPKR(preview.totals.net)}
              </span>
              <span className="text-muted-foreground">
                {locale === "ur" ? "گروس" : "Gross"}: {formatPKR(preview.totals.gross)}
              </span>
              <span className="text-muted-foreground">
                {locale === "ur" ? "کٹوتیاں" : "Deductions"}: {formatPKR(preview.totals.deductions)}
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">{locale === "ur" ? "مزدور" : "Worker"}</th>
                    <th>{locale === "ur" ? "قسم" : "Type"}</th>
                    <th>{locale === "ur" ? "دن" : "Days"}</th>
                    <th>{locale === "ur" ? "اینٹ" : "Bricks"}</th>
                    <th className="text-right">{locale === "ur" ? "خالص" : "Net"}</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.calculations.map((c) => (
                    <Fragment key={c.workerId}>
                      <tr
                        className="cursor-pointer border-b hover:bg-muted/50"
                        onClick={() =>
                          setExpanded(expanded === c.workerId ? null : c.workerId)
                        }
                      >
                        <td className="py-2 font-medium">{c.workerName}</td>
                        <td>
                          <Badge variant="outline" className="text-[10px]">
                            {wageTypeLabel(c.wageType as WageType, locale)}
                          </Badge>
                        </td>
                        <td>{c.presentDays + c.halfDays * 0.5}</td>
                        <td>{c.totalBricks > 0 ? c.totalBricks.toLocaleString() : "—"}</td>
                        <td className="text-right font-semibold">{formatPKR(c.netPay)}</td>
                      </tr>
                      {expanded === c.workerId && (
                        <tr>
                          <td colSpan={5} className="bg-muted/30 px-3 py-2">
                            <ul className="space-y-1">
                              {c.items.map((item) => (
                                <li key={item.key} className="flex justify-between gap-4">
                                  <span>
                                    {locale === "ur" ? item.labelUr : item.labelEn}
                                  </span>
                                  <span className={item.amount < 0 ? "text-red-600" : ""}>
                                    {formatPKR(Math.abs(item.amount))}
                                    {item.amount < 0 ? " −" : ""}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {c.skipReason && (
                              <p className="mt-1 text-amber-600">{c.skipReason}</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
