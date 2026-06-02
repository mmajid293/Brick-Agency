"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckOutDialog } from "@/components/attendance/check-out-dialog";
import { ATTENDANCE_STATUSES, type AttendanceStatusValue } from "@/lib/attendance-status";
import { WORKER_CATEGORIES, legacyRoleToCategory } from "@/lib/worker-categories";
import type { WorkerJobRole } from "@prisma/client";
import { summarizeWorkReport, parseWorkReport } from "@/lib/work-report";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, ChevronDown, ChevronUp } from "lucide-react";

export type WorkerRow = {
  id: string;
  name: string;
  nameUrdu?: string | null;
  workerCode: string | null;
  department?: string;
  jobRole?: string;
  category?: { code: string } | null;
  standardHoursPerDay?: string | number;
};

export type AttendanceRecord = {
  id: string;
  worker: { id: string };
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  regularHours?: string | number;
  extraHours?: string | number;
  workReport?: unknown;
  taskCompleted?: string | null;
};

type Props = {
  workers: WorkerRow[];
  records: AttendanceRecord[];
  loading?: boolean;
  savingWorkerId: string | null;
  date: string;
  /** When set, only show this work group (single-group page). */
  filterRole?: string;
  onCheckIn: (
    workerId: string,
    opts?: { checkIn?: string; useManualTime?: boolean }
  ) => Promise<void>;
  onCheckOut: (payload: {
    workerId: string;
    checkOut?: string;
    useManualTime: boolean;
    workReport: Record<string, string | number | undefined>;
    taskCompleted: string;
    notes: string;
  }) => Promise<boolean>;
  onMark: (workerId: string, status: AttendanceStatusValue) => void;
};

function formatTime(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

export function RoleGroupedAttendance({
  workers,
  records,
  loading,
  savingWorkerId,
  date,
  onCheckIn,
  onCheckOut,
  onMark,
  filterRole,
}: Props) {
  const { locale } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const r of WORKER_CATEGORIES) init[r.code] = true;
    return init;
  });
  const [checkInDialog, setCheckInDialog] = useState<WorkerRow | null>(null);
  const [manualCheckIn, setManualCheckIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState("06:00");
  const [checkOutWorker, setCheckOutWorker] = useState<{
    id: string;
    name: string;
    jobRole: string;
    category?: { code: string } | null;
    checkIn?: string | null;
  } | null>(null);

  const recordByWorker = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of records) map.set(r.worker.id, r);
    return map;
  }, [records]);

  const groups = useMemo(() => {
    const list = WORKER_CATEGORIES.map((cat) => ({
      role: cat.code,
      label: locale === "ur" ? cat.nameUr : cat.nameEn,
      workers: workers.filter((w) => {
        if (w.category?.code) return w.category.code === cat.code;
        return legacyRoleToCategory((w.jobRole || "OTHER") as WorkerJobRole) === cat.code;
      }),
    })).filter((g) => g.workers.length > 0);
    if (filterRole) {
      return list.filter((g) => g.role === filterRole);
    }
    return list;
  }, [workers, locale, filterRole]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-on-surface-variant">
        {locale === "ur" ? "کوئی فعال مزدور نہیں" : "No active workers."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!filterRole && (
        <p className="text-sm text-on-surface-variant">
          {locale === "ur"
            ? "مزدور اپنے کام کے گروپ میں — چیک ان / چیک آؤٹ اور حاضری"
            : "Workers grouped by job role — check in, check out, and mark status."}
        </p>
      )}

      {groups.map((group) => {
        const isOpen = filterRole ? true : expanded[group.role] !== false;
        const present = group.workers.filter((w) => {
          const rec = recordByWorker.get(w.id);
          return rec && ["PRESENT", "OVERTIME", "HALF_DAY"].includes(rec.status);
        }).length;

        return (
          <section
            key={group.role}
            className="overflow-hidden rounded-2xl border-2 border-outline-variant/40 bg-surface-container/30"
          >
            {!filterRole && (
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 bg-primary/5 px-4 py-3 text-left"
                onClick={() =>
                  setExpanded((e) => ({ ...e, [group.role]: !isOpen }))
                }
              >
                <div>
                  <p className="font-display text-lg font-bold text-on-surface">{group.label}</p>
                  <p className="text-sm text-on-surface-variant">
                    {present}/{group.workers.length}{" "}
                    {locale === "ur" ? "حاضر" : "present"}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </button>
            )}

            {isOpen && (
              <div className="space-y-3 p-3">
                {group.workers.map((w) => {
                  const rec = recordByWorker.get(w.id);
                  const saving = savingWorkerId === w.id;
                  const checkedIn = !!rec?.checkIn;
                  const checkedOut = !!rec?.checkOut;
                  const report = parseWorkReport(rec?.workReport);

                  return (
                    <div
                      key={w.id}
                      className="rounded-xl border border-outline-variant/30 bg-surface-container/50 p-3"
                    >
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-on-surface">{w.name}</p>
                          {w.nameUrdu && (
                            <p className="font-urdu text-sm text-on-surface-variant">{w.nameUrdu}</p>
                          )}
                          <p className="text-xs text-on-surface-variant">
                            {w.workerCode && <span className="font-mono">{w.workerCode}</span>}
                          </p>
                        </div>
                        {rec && (
                          <Badge variant="outline">{rec.status}</Badge>
                        )}
                      </div>

                      {(checkedIn || checkedOut) && (
                        <p className="mb-2 text-sm text-on-surface-variant">
                          {locale === "ur" ? "ان" : "In"}: {formatTime(rec?.checkIn) ?? "—"}
                          {" · "}
                          {locale === "ur" ? "آؤٹ" : "Out"}: {formatTime(rec?.checkOut) ?? "—"}
                          {Number(rec?.extraHours) > 0 && (
                            <span className="text-primary"> (+{Number(rec?.extraHours)}h)</span>
                          )}
                        </p>
                      )}

                      {checkedOut && (
                        <p className="mb-2 text-xs text-on-surface-variant">
                          {summarizeWorkReport(w.jobRole || "OTHER", report, locale)}
                        </p>
                      )}

                      <div className="mb-2 flex flex-wrap gap-2">
                        {!checkedIn && (
                          <Button
                            type="button"
                            size="sm"
                            className="gap-1"
                            disabled={saving}
                            onClick={() => {
                              setCheckInDialog(w);
                              const now = new Date();
                              setCheckInTime(
                                `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
                              );
                              setManualCheckIn(false);
                            }}
                          >
                            <LogIn className="h-4 w-4" />
                            {locale === "ur" ? "چیک ان" : "Check in"}
                          </Button>
                        )}
                        {checkedIn && !checkedOut && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="gap-1"
                            disabled={saving}
                            onClick={() =>
                              setCheckOutWorker({
                                id: w.id,
                                name: w.name,
                                jobRole: w.jobRole || "OTHER",
                                category: w.category,
                                checkIn: rec?.checkIn,
                              })
                            }
                          >
                            <LogOut className="h-4 w-4" />
                            {locale === "ur" ? "چیک آؤٹ + رپورٹ" : "Check out + report"}
                          </Button>
                        )}
                        {checkedOut && (
                          <Badge className="bg-green-500/20 text-green-800">
                            {locale === "ur" ? "مکمل" : "Shift done"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {ATTENDANCE_STATUSES.map((s) => {
                          const isActive = rec?.status === s.value;
                          const label = locale === "ur" ? s.labelUr : s.labelEn;
                          return (
                            <Button
                              key={s.value}
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={saving}
                              onClick={() => onMark(w.id, s.value)}
                              className={cn(
                                "text-xs",
                                s.btnClass,
                                isActive && s.activeClass
                              )}
                            >
                              {label}
                            </Button>
                          );
                        })}
                      </div>
                      </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <Dialog open={!!checkInDialog} onOpenChange={(o) => !o && setCheckInDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === "ur" ? "چیک ان" : "Check in"} — {checkInDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={manualCheckIn}
                onChange={(e) => setManualCheckIn(e.target.checked)}
              />
              {locale === "ur" ? "وقت خود درج کریں" : "Set time manually"}
            </label>
            {manualCheckIn && (
              <div>
                <Label>{locale === "ur" ? "چیک ان وقت" : "Check-in time"}</Label>
                <Input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
              </div>
            )}
            <Button
              className="w-full"
              disabled={savingWorkerId === checkInDialog?.id}
              onClick={async () => {
                if (!checkInDialog) return;
                await onCheckIn(checkInDialog.id, {
                  checkIn: manualCheckIn ? checkInTime : undefined,
                  useManualTime: manualCheckIn,
                });
                setCheckInDialog(null);
              }}
            >
              {locale === "ur" ? "چیک ان محفوظ" : "Save check-in"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CheckOutDialog
        open={!!checkOutWorker}
        onOpenChange={(o) => !o && setCheckOutWorker(null)}
        worker={checkOutWorker}
        date={date}
        loading={!!savingWorkerId}
        onSubmit={onCheckOut}
      />
    </div>
  );
}
