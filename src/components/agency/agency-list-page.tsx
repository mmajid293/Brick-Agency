"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/easy/page-header";
import { WriteGuard } from "@/components/crud/write-guard";
import { Loader2, Plus } from "lucide-react";
import type { Role } from "@prisma/client";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
};

export function AgencyListPage({
  title,
  titleUr,
  apiPath,
  fields,
  columns,
  minRole = "MANAGER",
  emptyCreate,
}: {
  title: string;
  titleUr: string;
  apiPath: string;
  fields: Field[];
  columns: { key: string; label: string; render?: (row: Record<string, unknown>) => string }[];
  minRole?: Role;
  emptyCreate?: Record<string, unknown>;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(apiPath, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setRows(res.data);
      })
      .finally(() => setLoading(false));
  }, [apiPath]);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body: Record<string, unknown> = { ...emptyCreate };
    for (const f of fields) {
      const v = form[f.key];
      if (v === undefined || v === "") continue;
      body[f.key] = f.type === "number" ? Number(v) : v;
    }
    const res = await fetch(apiPath, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) {
      setForm({});
      load();
    } else {
      alert(json.error ?? "Save failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} titleUr={titleUr} />

      <WriteGuard minRole={minRole}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" /> Add new
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label>{f.label}</Label>
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    required={f.required}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex items-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </WriteGuard>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {columns.map((c) => (
                      <th key={c.key} className="px-4 py-3 text-left font-semibold">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={String(row.id)} className="border-b">
                      {columns.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          {c.render ? c.render(row) : String(row[c.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
