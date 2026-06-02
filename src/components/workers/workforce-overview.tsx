"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/app-context";
import { departmentLabel } from "@/lib/departments";
import { Factory, Flame, Truck, Wrench, Users } from "lucide-react";

type WorkforceStats = {
  totalWorkers: number;
  presentToday: number;
  byDepartment: {
    code: string;
    nameEn: string;
    nameUr: string;
    workerCount: number;
    presentToday: number;
  }[];
  byAttendanceMode: { mode: string; workerCount: number; presentToday: number }[];
};

const MODE_ICONS: Record<string, typeof Users> = {
  PRODUCTION: Factory,
  SHIFT: Flame,
  TRIP: Truck,
  STANDARD: Users,
  TEAM_MONITOR: Wrench,
};

export function WorkforceOverview() {
  const { locale } = useApp();
  const [data, setData] = useState<WorkforceStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/workforce/stats", { credentials: "include" });
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-on-surface-variant">
              {locale === "ur" ? "کل مزدور" : "Total workforce"}
            </p>
            <p className="font-display text-3xl font-bold text-primary">{data.totalWorkers}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-green-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-on-surface-variant">
              {locale === "ur" ? "آج حاضر" : "Present today"}
            </p>
            <p className="font-display text-3xl font-bold text-green-700">{data.presentToday}</p>
          </CardContent>
        </Card>
        <Card className="glass-card sm:col-span-2">
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium">
              {locale === "ur" ? "محکمے کے لحاظ سے" : "By department"}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.byDepartment
                .filter((d) => d.workerCount > 0)
                .map((d) => (
                  <Badge key={d.code} variant="secondary" className="gap-1">
                    {departmentLabel(d.code, locale)}: {d.workerCount}
                    <span className="text-green-700">({d.presentToday})</span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {locale === "ur" ? "حاضری کے طریقے" : "Attendance by work type"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {data.byAttendanceMode
              .filter((m) => m.workerCount > 0)
              .map((m) => {
                const Icon = MODE_ICONS[m.mode] ?? Users;
                return (
                  <div
                    key={m.mode}
                    className="flex items-center gap-3 rounded-xl border border-outline-variant/30 p-3"
                  >
                    <Icon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-xs text-on-surface-variant">{m.mode}</p>
                      <p className="font-bold">
                        {m.presentToday}/{m.workerCount}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
