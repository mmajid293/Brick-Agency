"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModuleToolbar } from "@/components/crud/module-toolbar";
import { PageHeader } from "@/components/easy/page-header";
import { HelpTip } from "@/components/easy/help-tip";
import { WriteGuard } from "@/components/crud/write-guard";
import { StatsRow } from "@/components/module/stats-row";
import { useApi } from "@/hooks/use-api";
import { Factory } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";

type ProdRecord = {
  date: string;
  rawProduced: number;
  cookedProduced: number;
  gradeA: number;
  wastage: number;
  kilnCycle: number;
};

export default function ProductionPage() {
  const { request, loading } = useApi();
  const [records, setRecords] = useState<ProdRecord[]>([]);
  const [kilnLogs, setKilnLogs] = useState<{ temperature: number; fuelUsed: number; cycleNumber: number; recordedAt: string }[]>([]);
  const [totals, setTotals] = useState({ raw: 0, cooked: 0, gradeA: 0, wastage: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [prodOpen, setProdOpen] = useState(false);
  const [kilnOpen, setKilnOpen] = useState(false);
  const [prodForm, setProdForm] = useState({
    date: new Date().toISOString().split("T")[0],
    rawProduced: 0, cookedProduced: 0, gradeA: 0, gradeB: 0, broken: 0, wastage: 0, kilnCycle: 1, temperature: 900,
  });
  const [kilnForm, setKilnForm] = useState({ temperature: 900, fuelUsed: 2, cycleNumber: 1, fuelType: "Coal" });

  const load = useCallback(async () => {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);
    const qs = params.toString();
    const res = await fetch(`/api/production${qs ? `?${qs}` : ""}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setRecords(json.data.records);
      setTotals(json.data.totals);
      setKilnLogs(json.data.kilnLogs ?? []);
    }
    setLoadingData(false);
  }, [filterFrom, filterTo]);

  useEffect(() => { load(); }, [load]);

  const filteredRecords = useMemo(() => {
    if (!filterFrom && !filterTo) return records;
    return records.filter((r) => {
      const d = new Date(r.date).toISOString().split("T")[0];
      if (filterFrom && d < filterFrom) return false;
      if (filterTo && d > filterTo) return false;
      return true;
    });
  }, [records, filterFrom, filterTo]);

  const saveProduction = async () => {
    const res = await request("/api/production", { method: "POST", body: JSON.stringify(prodForm), successMessage: "Production saved" });
    if (res.success) { setProdOpen(false); load(); }
  };

  const saveKiln = async () => {
    const res = await request("/api/production", { method: "POST", body: JSON.stringify({ action: "kiln", ...kilnForm }), successMessage: "Kiln log saved" });
    if (res.success) { setKilnOpen(false); load(); }
  };

  const clearFilters = () => {
    setFilterFrom("");
    setFilterTo("");
  };

  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Production"
        titleUr="پیداوار"
        hint="Tap Daily Entry to record bricks. Use date filters to see old days."
        hintUr="اینٹوں کا ریکارڈ: روزانہ انٹری۔ پرانی تاریخ: اوپر تاریخ چنیں۔"
      />
      <HelpTip childrenUr="بڑا نارنجی بٹن = آج کی پیداوار شامل کریں۔">
        Big orange button = add today&apos;s production.
      </HelpTip>
      <StatsRow items={[
        { label: "Raw (period)", value: formatNumber(totals.raw), icon: Factory },
        { label: "Cooked (period)", value: formatNumber(totals.cooked), icon: Factory },
        { label: "Grade A (period)", value: formatNumber(totals.gradeA), icon: Factory },
        { label: "Wastage (period)", value: formatNumber(totals.wastage), icon: Factory },
      ]} />
      <ModuleToolbar search="" onSearchChange={() => {}} onAdd={() => setProdOpen(true)} addLabel="Daily Entry" minRole="SUPERVISOR">
        <WriteGuard minRole="SUPERVISOR">
          <Button size="sm" variant="outline" onClick={() => setKilnOpen(true)}>Kiln Log</Button>
        </WriteGuard>
        <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-auto" title="From date" />
        <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-auto" title="To date" />
        {(filterFrom || filterTo) && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>Clear</Button>
        )}
      </ModuleToolbar>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Production History ({filteredRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? <Skeleton className="h-48" /> : filteredRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records for selected dates.</p>
            ) : (
              <table className="table-premium w-full text-sm">
                <thead><tr className="border-b text-left"><th className="pb-2">Date</th><th>Raw</th><th>Cooked</th><th>A</th><th>Wastage</th></tr></thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr key={`${r.date}-${r.kilnCycle}`} className="border-b border-brick/5">
                      <td className="py-2">{formatDate(r.date)}</td>
                      <td>{formatNumber(r.rawProduced)}</td>
                      <td>{formatNumber(r.cookedProduced)}</td>
                      <td>{formatNumber(r.gradeA)}</td>
                      <td>{formatNumber(r.wastage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle>Kiln Logs</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {kilnLogs.length === 0 ? <p className="text-muted-foreground">No kiln logs yet.</p> : kilnLogs.map((k, i) => (
              <p key={i}>{formatDate(k.recordedAt)} — {Number(k.temperature)}°C — Fuel {Number(k.fuelUsed)}t — Cycle {k.cycleNumber}</p>
            ))}
          </CardContent>
        </Card>
      </div>
      <Dialog open={prodOpen} onOpenChange={setProdOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Daily Production</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Date</Label><Input type="date" value={prodForm.date} onChange={(e) => setProdForm({ ...prodForm, date: e.target.value })} /></div>
            {(["rawProduced", "cookedProduced", "gradeA", "gradeB", "broken", "wastage"] as const).map((f) => (
              <div key={f}><Label>{f}</Label><Input type="number" value={prodForm[f]} onChange={(e) => setProdForm({ ...prodForm, [f]: Number(e.target.value) })} /></div>
            ))}
            <Button className="sm:col-span-2" onClick={saveProduction} disabled={loading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={kilnOpen} onOpenChange={setKilnOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Kiln Temperature Log</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Temperature °C</Label><Input type="number" value={kilnForm.temperature} onChange={(e) => setKilnForm({ ...kilnForm, temperature: Number(e.target.value) })} /></div>
            <div><Label>Fuel Used (tons)</Label><Input type="number" step="0.1" value={kilnForm.fuelUsed} onChange={(e) => setKilnForm({ ...kilnForm, fuelUsed: Number(e.target.value) })} /></div>
            <div><Label>Cycle #</Label><Input type="number" value={kilnForm.cycleNumber} onChange={(e) => setKilnForm({ ...kilnForm, cycleNumber: Number(e.target.value) })} /></div>
            <Button onClick={saveKiln} disabled={loading}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
