"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/easy/page-header";
import { RoleGroupedAttendance } from "@/components/attendance/role-grouped-attendance";
import { QrCheckinPanel } from "@/components/attendance/qr-checkin-panel";
import { useApp } from "@/context/app-context";
import { useApi } from "@/hooks/use-api";
import { isValidGroupKey, normalizeGroupKey, workGroupMeta } from "@/lib/work-group-meta";
import { categoryLabel } from "@/lib/worker-categories";
import type { AttendanceStatusValue } from "@/lib/attendance-status";
import type { WorkerCategoryCode } from "@/lib/worker-categories";
import { legacyRoleToCategory } from "@/lib/worker-categories";
import type { WorkerJobRole } from "@prisma/client";
import { formatDate, cn } from "@/lib/utils";

type AttendanceRecord = {
  id: string;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  regularHours?: string | number;
  extraHours?: string | number;
  workReport?: unknown;
  taskCompleted?: string | null;
  worker: {
    id: string;
    name: string;
    nameUrdu: string | null;
    department: string;
    workerCode: string | null;
    jobRole?: string;
  };
};

type WorkerOpt = {
  id: string;
  name: string;
  workerCode: string | null;
  department?: string;
  jobRole?: string;
  category?: { code: string } | null;
  standardHoursPerDay?: string | number;
};

function AttendanceGroupContent({ categoryCode }: { categoryCode: WorkerCategoryCode }) {
  const { locale } = useApp();
  const searchParams = useSearchParams();
  const { request } = useApi();
  const meta = workGroupMeta(categoryCode);
  const Icon = meta.icon;
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerOpt[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [savingWorkerId, setSavingWorkerId] = useState<string | null>(null);

  const groupWorkers = workers.filter(
    (w) =>
      w.category?.code === categoryCode ||
      legacyRoleToCategory((w.jobRole || "OTHER") as WorkerJobRole) === categoryCode
  );
  const groupRecords = records.filter((r) =>
    groupWorkers.some((w) => w.id === r.worker.id)
  );

  const load = useCallback(async () => {
    setLoadingData(true);
    setError("");
    const res = await fetch(`/api/attendance?from=${date}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setRecords(json.data.records);
      setWorkers(json.data.workers ?? []);
    } else setError(json.error);
    setLoadingData(false);
  }, [date]);

  useEffect(() => {
    const d = searchParams.get("date");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDate(d);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const markOne = async (workerId: string, status: AttendanceStatusValue) => {
    setSavingWorkerId(workerId);
    await request("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ workerId, status, date }),
    });
    setSavingWorkerId(null);
    load();
  };

  const handleCheckIn = async (
    workerId: string,
    opts?: { checkIn?: string; useManualTime?: boolean }
  ) => {
    setSavingWorkerId(workerId);
    await request("/api/attendance/check-in", {
      method: "POST",
      body: JSON.stringify({ workerId, date, ...opts }),
    });
    setSavingWorkerId(null);
    load();
  };

  const handleCheckOut = async (payload: {
    workerId: string;
    checkOut?: string;
    useManualTime: boolean;
    workReport: Record<string, string | number | undefined>;
    taskCompleted: string;
    notes: string;
  }) => {
    setSavingWorkerId(payload.workerId);
    const res = await request("/api/attendance/check-out", {
      method: "POST",
      body: JSON.stringify({ ...payload, date }),
    });
    setSavingWorkerId(null);
    if (res.success) load();
    return !!res.success;
  };

  const title = categoryLabel(categoryCode, locale);
  const present = groupRecords.filter((r) =>
    ["PRESENT", "OVERTIME", "HALF_DAY"].includes(r.status)
  ).length;

  return (
    <div className="easy-page space-y-6">
      <Link href={`/dashboard/attendance?date=${date}`}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {locale === "ur" ? "تمام گروپ" : "All work groups"}
        </Button>
      </Link>

      <PageHeader
        title={title}
        titleUr={title}
        hint={locale === "ur" ? meta.workHintUr : meta.workHintEn}
        hintUr={meta.workHintUr}
      />

      <Card className={cn("border-2", meta.border)}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br", meta.gradient)}>
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {present}/{groupWorkers.length}{" "}
                {locale === "ur" ? "حاضر آج" : "present today"}
              </p>
              <p className="text-sm text-on-surface-variant">{formatDate(date)}</p>
            </div>
          </div>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-auto" />
        </CardContent>
      </Card>

      {error && <p className="text-red-600">{error}</p>}

      <QrCheckinPanel workers={groupWorkers} onSuccess={load} />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleGroupedAttendance
            workers={groupWorkers}
            records={groupRecords}
            loading={loadingData}
            savingWorkerId={savingWorkerId}
            date={date}
            filterRole={categoryCode}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onMark={markOne}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AttendanceGroupPageInner({ categoryCode }: { categoryCode: WorkerCategoryCode }) {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <AttendanceGroupContent categoryCode={categoryCode} />
    </Suspense>
  );
}

export default function AttendanceGroupPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = use(params);
  if (!isValidGroupKey(role)) notFound();
  return <AttendanceGroupPageInner categoryCode={normalizeGroupKey(role)} />;
}
