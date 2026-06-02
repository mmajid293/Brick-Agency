"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ATTENDANCE_STATUSES, type AttendanceStatusValue } from "@/lib/attendance-status";
import { workerJobRoleLabel } from "@/lib/worker-roles";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type WorkerRow = {
  id: string;
  name: string;
  workerCode: string | null;
  department?: string;
  jobRole?: string;
  standardHoursPerDay?: string | number;
  bricksTargetPerDay?: number | null;
};

type AttendanceRecord = {
  worker: { id: string };
  status: string;
  regularHours?: string | number;
  extraHours?: string | number;
  bricksProduced?: number | null;
};

export type AttendanceHoursPayload = {
  regularHours?: number;
  extraHours?: number;
  bricksProduced?: number | null;
};

type Props = {
  workers: WorkerRow[];
  records: AttendanceRecord[];
  loading?: boolean;
  savingWorkerId: string | null;
  onMark: (workerId: string, status: AttendanceStatusValue, hours?: AttendanceHoursPayload) => void;
};

type HoursState = {
  regularHours: string;
  extraHours: string;
  bricksProduced: string;
};

export function QuickAttendanceList({
  workers,
  records,
  loading,
  savingWorkerId,
  onMark,
}: Props) {
  const { locale } = useApp();
  const [hoursByWorker, setHoursByWorker] = useState<Record<string, HoursState>>({});

  const statusByWorker = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of records) {
      map.set(r.worker.id, r);
    }
    return map;
  }, [records]);

  useEffect(() => {
    const next: Record<string, HoursState> = {};
    for (const w of workers) {
      const rec = statusByWorker.get(w.id);
      const std = Number(w.standardHoursPerDay ?? 8);
      next[w.id] = {
        regularHours: String(rec?.regularHours ?? std),
        extraHours: String(rec?.extraHours ?? 0),
        bricksProduced: String(rec?.bricksProduced ?? w.bricksTargetPerDay ?? ""),
      };
    }
    setHoursByWorker(next);
  }, [workers, statusByWorker]);

  const getHours = (workerId: string): AttendanceHoursPayload => {
    const h = hoursByWorker[workerId];
    if (!h) return {};
    return {
      regularHours: h.regularHours === "" ? undefined : Number(h.regularHours),
      extraHours: h.extraHours === "" ? 0 : Number(h.extraHours),
      bricksProduced: h.bricksProduced === "" ? null : Number(h.bricksProduced),
    };
  };

  const setHourField = (workerId: string, field: keyof HoursState, value: string) => {
    setHoursByWorker((prev) => ({
      ...prev,
      [workerId]: {
        ...(prev[workerId] ?? { regularHours: "8", extraHours: "0", bricksProduced: "" }),
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-on-surface-variant">
        {locale === "ur" ? "کوئی فعال مزدور نہیں" : "No active workers found."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-on-surface-variant">
        {locale === "ur"
          ? "حاضری لگائیں، گھنٹے اور اضافی کام درج کریں"
          : "Mark attendance, then set regular hours, extra hours, and bricks if needed."}
      </p>
      {workers.map((w) => {
        const current = statusByWorker.get(w.id);
        const saving = savingWorkerId === w.id;
        const hours = hoursByWorker[w.id];

        return (
          <div
            key={w.id}
            className={cn(
              "easy-tap rounded-2xl border-2 bg-surface-container/50 p-4 transition",
              current ? "border-primary/30" : "border-outline-variant/40"
            )}
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-bold text-on-surface">{w.name}</p>
                <p className="text-sm text-on-surface-variant">
                  {w.workerCode && <span className="font-mono">{w.workerCode}</span>}
                  {w.workerCode && " · "}
                  {w.jobRole ? workerJobRoleLabel(w.jobRole, locale === "ur" ? "ur" : "en") : w.department}
                </p>
              </div>
              {current && (
                <Badge className="gap-1 text-sm">
                  <Check className="h-3 w-3" />
                  {ATTENDANCE_STATUSES.find((s) => s.value === current.status)?.[
                    locale === "ur" ? "labelUr" : "labelEn"
                  ] ?? current.status}
                </Badge>
              )}
            </div>

            {hours && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">{locale === "ur" ? "گھنٹے" : "Hours"}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    max={24}
                    className="h-10"
                    value={hours.regularHours}
                    onChange={(e) => setHourField(w.id, "regularHours", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">{locale === "ur" ? "اضافی" : "Extra"}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    max={16}
                    className="h-10"
                    value={hours.extraHours}
                    onChange={(e) => setHourField(w.id, "extraHours", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">{locale === "ur" ? "اینٹ" : "Bricks"}</Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-10"
                    placeholder="—"
                    value={hours.bricksProduced}
                    onChange={(e) => setHourField(w.id, "bricksProduced", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {ATTENDANCE_STATUSES.map((s) => {
                const isActive = current?.status === s.value;
                const label = locale === "ur" ? s.labelUr : s.labelEn;
                return (
                  <Button
                    key={s.value}
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => onMark(w.id, s.value, getHours(w.id))}
                    className={cn(
                      "easy-tap min-h-[48px] flex-1 min-w-[88px] text-base font-bold sm:flex-none sm:min-w-[100px]",
                      s.btnClass,
                      isActive && s.activeClass
                    )}
                  >
                    {saving && isActive ? "…" : label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
