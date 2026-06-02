"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/easy/page-header";
import { WriteGuard } from "@/components/crud/write-guard";
import { Flame } from "lucide-react";

type KilnRow = {
  id: string;
  code: string;
  name: string;
  nameUr: string | null;
  capacity: number | null;
  batches: {
    id: string;
    batchNumber: number;
    status: string;
    loadDate: string;
    bricksIn: number;
    bricksOutA: number;
    temperature: string | null;
  }[];
};

const STATUS_FLOW = ["LOADING", "FIRING", "COOLING", "UNLOADED"] as const;

export default function KilnsPage() {
  const [kilns, setKilns] = useState<KilnRow[]>([]);

  const load = useCallback(() => {
    fetch("/api/kilns", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setKilns(res.data);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function advanceBatch(batchId: string, current: string) {
    const idx = STATUS_FLOW.indexOf(current as (typeof STATUS_FLOW)[number]);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    await fetch(`/api/kilns/batches/${batchId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Kiln Batches" titleUr="بھٹہ چولہے / بیچ" />

      <div className="grid gap-4 md:grid-cols-2">
        {kilns.map((kiln) => (
          <Card key={kiln.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-600" />
                {kiln.name} ({kiln.code})
              </CardTitle>
              <Badge variant="outline">
                {kiln.capacity ? `${kiln.capacity.toLocaleString()} cap.` : "Kiln"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {kiln.batches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No batches yet</p>
              ) : (
                kiln.batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        Batch #{b.batchNumber} — {b.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Loaded: {b.bricksIn.toLocaleString()} bricks
                        {b.temperature ? ` · ${b.temperature}°C` : ""}
                      </p>
                    </div>
                    <WriteGuard minRole="SUPERVISOR">
                      {b.status !== "UNLOADED" && (
                        <Button size="sm" variant="secondary" onClick={() => advanceBatch(b.id, b.status)}>
                          Advance →
                        </Button>
                      )}
                    </WriteGuard>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
