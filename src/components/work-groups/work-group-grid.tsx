"use client";

import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/app-context";
import { allWorkGroups, workGroupMeta } from "@/lib/work-group-meta";
import { categoryLabel, wageTypeLabel } from "@/lib/worker-categories";
import { departmentLabel } from "@/lib/departments";
import { cn } from "@/lib/utils";
import type { WorkerCategoryCode } from "@/lib/worker-categories";

export type WorkGroupSummary = {
  role: string;
  code?: string;
  labelEn: string;
  labelUr: string;
  department: string;
  departmentCode?: string;
  wageType?: string;
  workerCount: number;
  presentToday: number;
  checkedInToday: number;
  checkedOutToday: number;
};

type Props = {
  summaries: WorkGroupSummary[];
  loading?: boolean;
  module: "workers" | "attendance";
  date?: string;
  showEmpty?: boolean;
};

export function WorkGroupGrid({ summaries, loading, module, date, showEmpty }: Props) {
  const { locale } = useApp();
  const summaryMap = new Map(
    summaries.map((s) => [(s.code ?? s.role) as WorkerCategoryCode, s])
  );
  const groups = allWorkGroups().filter((g) => {
    const s = summaryMap.get(g.code);
    if (showEmpty) return true;
    return (s?.workerCount ?? 0) > 0;
  });

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="glass-card border-dashed p-8 text-center">
        <p className="text-on-surface-variant">
          {locale === "ur"
            ? "کوئی فعال مزدور نہیں — پہلے مزدور شامل کریں"
            : "No active workers — add workers in a category group"}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((g) => {
        const meta = workGroupMeta(g.code);
        const s = summaryMap.get(g.code);
        const Icon = meta.icon;
        const href =
          module === "workers"
            ? `/dashboard/workers/group/${g.code}`
            : `/dashboard/attendance/group/${g.code}${date ? `?date=${date}` : ""}`;
        const title = categoryLabel(g.code, locale);
        const count = s?.workerCount ?? 0;

        return (
          <Link key={g.code} href={href} className="block h-full">
            <Card
              className={cn(
                "glass-card heat-glow h-full overflow-hidden border-2 transition hover:scale-[1.02] active:scale-[0.99]",
                meta.border,
                count === 0 && "opacity-75"
              )}
            >
              <CardContent className="p-0">
                <div
                  className={cn(
                    "flex items-center gap-3 border-b border-outline-variant/20 bg-gradient-to-br px-4 py-4",
                    meta.gradient
                  )}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container/80 shadow-inner">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold leading-tight text-on-surface">
                      {title}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {departmentLabel(meta.departmentCode, locale)}
                    </p>
                  </div>
                  <ChevronRight className="h-6 w-6 shrink-0 text-primary" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {wageTypeLabel(meta.wageType, locale)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                      <Users className="h-4 w-4" />
                      {locale === "ur" ? "مزدور" : "Workers"}
                    </span>
                    <Badge variant="secondary" className="text-base font-bold">
                      {count}
                    </Badge>
                  </div>
                  {module === "attendance" && count > 0 && (
                    <p className="text-sm text-on-surface-variant">
                      {locale === "ur" ? "آج حاضر" : "Present today"}:{" "}
                      <strong className="text-green-700">
                        {s?.presentToday ?? 0}/{count}
                      </strong>
                    </p>
                  )}
                  <p className="text-xs text-on-surface-variant">
                    {locale === "ur" ? meta.workHintUr : meta.workHintEn}
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {locale === "ur" ? "گروپ کھولیں ←" : "Open group →"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
