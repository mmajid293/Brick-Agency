"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const reports = [
  { id: "attendance", title: "Attendance Report", titleUrdu: "حاضری رپورٹ", desc: "Daily worker hazri with QR status" },
  { id: "finance", title: "Financial Ledger", titleUrdu: "مالی رپورٹ", desc: "Income, expenses, PKR ledger" },
  { id: "workers", title: "Workers Report", titleUrdu: "مزدور رپورٹ", desc: "All workers, wages, advances" },
  { id: "inventory", title: "Inventory Snapshot", titleUrdu: "انوینٹری", desc: "Brick stock by grade" },
];

export default function ReportsPage() {
  const exportReport = (type: string, format: string) => {
    window.open(`/api/reports/export?type=${type}&format=${format}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Export</h1>
        <p className="text-muted-foreground">PDF and Excel from live database</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.id} className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brick" />
                {r.title}
              </CardTitle>
              <p className="font-urdu text-sm opacity-70">{r.titleUrdu}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => exportReport(r.id, "pdf")}>
                  <Download className="mr-1 h-4 w-4" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport(r.id, "xlsx")}>
                  <Download className="mr-1 h-4 w-4" /> Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
