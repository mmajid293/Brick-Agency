"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/easy/page-header";
import { HelpTip } from "@/components/easy/help-tip";
import { StatsRow } from "@/components/module/stats-row";
import { useApp } from "@/context/app-context";
import { attendanceStatusLabel } from "@/lib/attendance-status";
import { formatPKR, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  UserCircle,
  Calendar,
  Wallet,
  ClipboardCheck,
  Banknote,
  Phone,
  IdCard,
  MapPin,
  CheckCircle2,
  Loader2,
  LogOut,
} from "lucide-react";
import { CheckOutDialog } from "@/components/attendance/check-out-dialog";
import type { WorkReportData } from "@/lib/work-report";
import { workerJobRoleLabel } from "@/lib/worker-roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PortalData = {
  worker: {
    id: string;
    workerCode: string | null;
    name: string;
    nameUrdu: string | null;
    fatherName: string | null;
    cnic: string;
    phone: string;
    address: string;
    department: string;
    jobRole: string;
    dailyWage: string | number;
    perBrickRate: string | number;
    advanceBalance: string | number;
    joinDate: string;
    imageUrl: string | null;
    isActive: boolean;
  };
  today: { status: string; checkIn: string | null; checkOut: string | null } | null;
  monthSummary: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
    overtime: number;
  };
  attendances: { id: string; date: string; status: string }[];
  payrolls: {
    id: string;
    month: number;
    year: number;
    netPay: string | number;
    isPaid: boolean;
    baseSalary: string | number;
    deductions: string | number;
  }[];
  advances: { id: string; amount: string | number; date: string; reason: string | null }[];
};

type PickerWorker = {
  id: string;
  name: string;
  nameUrdu: string | null;
  workerCode: string | null;
  jobRole: string;
  department: string;
};

export function WorkerPortalView() {
  const { locale, translate } = useApp();
  const [data, setData] = useState<PortalData | null>(null);
  const [pickerWorkers, setPickerWorkers] = useState<PickerWorker[] | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [managedBySupervisor, setManagedBySupervisor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState("");
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];

  const load = useCallback(async (workerId?: string) => {
    setLoading(true);
    setError(null);
    const url = workerId
      ? `/api/portal?workerId=${encodeURIComponent(workerId)}`
      : "/api/portal";
    const res = await fetch(url, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      if (json.data.mode === "picker") {
        setPickerWorkers(json.data.workers);
        setData(null);
        setManagedBySupervisor(true);
        setSelectedWorkerId("");
      } else {
        const { mode: _mode, managedBySupervisor: managed, ...portal } = json.data;
        setPickerWorkers(null);
        setData(portal as PortalData);
        setManagedBySupervisor(!!managed);
        setSelectedWorkerId(portal.worker.id);
      }
    } else {
      setData(null);
      setPickerWorkers(null);
      setError(json.error ?? "Could not load portal");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = async () => {
    if (!data?.worker) return;
    setCheckingIn(true);
    setCheckInMsg("");
    const res = await fetch(
      managedBySupervisor ? "/api/attendance/check-in" : "/api/portal/check-in",
      {
        method: "POST",
        credentials: "include",
        headers: managedBySupervisor ? { "Content-Type": "application/json" } : undefined,
        body: managedBySupervisor
          ? JSON.stringify({ workerId: data.worker.id, date: todayDate })
          : undefined,
      }
    );
    const json = await res.json();
    setCheckingIn(false);
    if (json.success) {
      setCheckInMsg(
        locale === "ur" ? "چیک ان محفوظ ہو گیا" : "Check-in saved"
      );
      load(managedBySupervisor ? data.worker.id : undefined);
    } else {
      setCheckInMsg(json.error ?? "Check-in failed");
    }
  };

  if (loading) {
    return (
      <div className="easy-page space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="easy-page space-y-6">
        <PageHeader
          title="Worker Portal"
          titleUr="مزدور پورٹل"
          hint="Your account must be linked to a worker record by the admin."
          hintUr="ایڈمن کو آپ کا اکاؤنٹ مزدور سے جوڑنا ہوگا۔"
        />
        <Card className="glass-card border-amber-500/40">
          <CardContent className="space-y-4 p-6 text-center">
            <UserCircle className="mx-auto h-16 w-16 text-amber-600" />
            <p className="text-lg font-semibold text-on-surface">
              {locale === "ur" ? "پروفائل نہیں ملی" : "Profile not linked"}
            </p>
            <p className="text-base text-on-surface-variant">{error}</p>
            <p className="text-sm text-muted-foreground">
              {locale === "ur"
                ? "ڈیمو: worker@bhatha.pk / admin123 (ڈیٹابیس سیڈ کے بعد)"
                : "Demo login: worker@bhatha.pk / admin123 (after npm run db:seed)"}
            </p>
            <Button variant="outline" onClick={() => load()}>
              {locale === "ur" ? "دوبارہ کوشش" : "Try again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { worker, today, monthSummary, attendances, payrolls, advances } = data;
  const todayLabel = today
    ? attendanceStatusLabel(today.status, locale)
    : locale === "ur"
      ? "ابھی نہیں لگی"
      : "Not marked yet";
  const canCheckIn = !today?.checkIn;
  const canCheckOut = !!today?.checkIn && !today?.checkOut;

  const handleCheckOut = async (payload: {
    workerId: string;
    checkOut?: string;
    useManualTime: boolean;
    workReport: WorkReportData;
    taskCompleted: string;
    notes: string;
  }) => {
    setCheckingOut(true);
    const res = await fetch("/api/portal/check-out", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setCheckingOut(false);
    if (json.success) {
      setCheckInMsg(
        locale === "ur" ? "چیک آؤٹ اور کام کی رپورٹ محفوظ ہو گئی" : "Check-out and work report saved"
      );
      setCheckOutOpen(false);
      load();
      return true;
    }
    setCheckInMsg(json.error ?? "Check-out failed");
    return false;
  };

  const monthName = new Date().toLocaleDateString(locale === "ur" ? "ur-PK" : "en-PK", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="easy-page mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Worker Portal"
        titleUr="مزدور پورٹل"
        hint={translate("portalHelp")}
        hintUr={translate("portalHelp")}
      />
      <HelpTip childrenUr={translate("portalHelp")}>{translate("portalHelp")}</HelpTip>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-center text-lg">
            {locale === "ur" ? "میری شناخت (QR)" : "My check-in ID"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(worker.id)}`}
            alt="Worker QR"
            width={180}
            height={180}
            className="rounded-lg border bg-white p-2"
          />
          <p className="text-center font-mono text-sm text-on-surface-variant">{worker.workerCode}</p>
          <p className="max-w-xs text-center text-sm text-on-surface-variant">
            {locale === "ur"
              ? "سپروائزر کو یہ کوڈ دکھائیں یا اوپر «حاضر لگائیں» دبائیں۔"
              : "Show this to your supervisor, or tap Mark Present above."}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card heat-glow overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            {worker.imageUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary">
                <Image src={worker.imageUrl} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-2xl">{worker.name}</CardTitle>
              {worker.nameUrdu && (
                <p className="font-urdu text-lg text-on-surface-variant">{worker.nameUrdu}</p>
              )}
              <p className="mt-1 font-mono text-sm text-primary">{worker.workerCode}</p>
              <Badge className="mt-2" variant={worker.isActive ? "default" : "outline"}>
                {worker.department}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Info icon={IdCard} label="CNIC" value={worker.cnic} />
          <Info icon={Phone} label={locale === "ur" ? "فون" : "Phone"} value={worker.phone} />
          <Info
            icon={UserCircle}
            label={locale === "ur" ? "والد" : "Father"}
            value={worker.fatherName ?? "—"}
          />
          <Info icon={MapPin} label={locale === "ur" ? "پتہ" : "Address"} value={worker.address} />
          <Info
            icon={Wallet}
            label={locale === "ur" ? "روزانہ اجرت" : "Daily wage"}
            value={formatPKR(Number(worker.dailyWage))}
          />
          <Info
            icon={Banknote}
            label={locale === "ur" ? "پیشگی بقایا" : "Advance balance"}
            value={formatPKR(Number(worker.advanceBalance))}
            highlight={Number(worker.advanceBalance) > 0}
          />
        </CardContent>
      </Card>

      <Card className="glass-card border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            {locale === "ur" ? "آج کی حاضری" : "Today's attendance"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-on-surface-variant">
                {formatDate(new Date().toISOString())}
              </p>
              <p className="text-2xl font-bold text-on-surface">{todayLabel}</p>
            </div>
            {canCheckIn && (
              <Button
                size="lg"
                className="easy-tap h-14 min-w-[160px] text-lg font-bold"
                onClick={checkIn}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    {locale === "ur" ? "حاضر لگائیں" : "Mark Present"}
                  </>
                )}
              </Button>
            )}
            {!canCheckIn && today?.checkIn && (
              <p className="text-sm text-green-700">
                {locale === "ur" ? "چیک ان:" : "Check-in:"}{" "}
                {new Date(today.checkIn).toLocaleTimeString()}
                {today.checkOut && (
                  <>
                    {" · "}
                    {locale === "ur" ? "چیک آؤٹ:" : "Check-out:"}{" "}
                    {new Date(today.checkOut).toLocaleTimeString()}
                  </>
                )}
              </p>
            )}
            {canCheckOut && (
              <Button
                size="lg"
                variant="secondary"
                className="easy-tap h-14 min-w-[160px] text-lg font-bold"
                onClick={() => setCheckOutOpen(true)}
                disabled={checkingOut}
              >
                <LogOut className="mr-2 h-6 w-6" />
                {locale === "ur" ? "چیک آؤٹ + رپورٹ" : "Check out + report"}
              </Button>
            )}
          </div>
          {checkInMsg && (
            <p className="rounded-lg bg-green-500/10 p-3 text-center text-base text-green-800">
              {checkInMsg}
            </p>
          )}
        </CardContent>
      </Card>

      <StatsRow
        items={[
          {
            label: locale === "ur" ? `${monthName} — حاضر` : `${monthName} — Present`,
            value: String(monthSummary.present),
            icon: Calendar,
            color: "bg-green-500/20 text-green-700",
          },
          {
            label: locale === "ur" ? "غیر حاضر" : "Absent",
            value: String(monthSummary.absent),
            icon: Calendar,
            color: "bg-red-500/20 text-red-700",
          },
          {
            label: locale === "ur" ? "چھٹی" : "Leave",
            value: String(monthSummary.leave),
            icon: Calendar,
            color: "bg-blue-500/20 text-blue-700",
          },
          {
            label: locale === "ur" ? "تنخواہ ریکارڈ" : "Pay slips",
            value: String(payrolls.length),
            icon: Wallet,
          },
        ]}
      />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {locale === "ur" ? "حاضری کی تاریخ" : "Attendance history"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-center text-on-surface-variant">
              {locale === "ur" ? "کوئی ریکارڈ نہیں" : "No records yet"}
            </p>
          ) : (
            <ul className="space-y-2">
              {attendances.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-outline-variant/30 px-4 py-3"
                >
                  <span className="text-base font-medium">{formatDate(a.date)}</span>
                  <Badge variant="outline" className="text-sm">
                    {attendanceStatusLabel(a.status, locale)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {locale === "ur" ? "تنخواہ / وصولی" : "Payroll"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payrolls.length === 0 ? (
            <p className="text-center text-on-surface-variant">
              {locale === "ur" ? "ابھی تنخواہ نہیں" : "No payroll records yet"}
            </p>
          ) : (
            <ul className="space-y-2">
              {payrolls.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/30 px-4 py-3"
                >
                  <span className="font-medium">
                    {p.month}/{p.year}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatPKR(Number(p.netPay))}
                  </span>
                  <Badge variant={p.isPaid ? "default" : "outline"}>
                    {p.isPaid
                      ? locale === "ur"
                        ? "ادا شدہ"
                        : "Paid"
                      : locale === "ur"
                        ? "باقی"
                        : "Pending"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {advances.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === "ur" ? "پیشگی (پیشگی)" : "Advances (Peshgi)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advances.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
                >
                  <span className="text-sm">{formatDate(a.date)}</span>
                  <span className="font-bold text-amber-800">{formatPKR(Number(a.amount))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <CheckOutDialog
        open={checkOutOpen}
        onOpenChange={setCheckOutOpen}
        worker={
          checkOutOpen
            ? {
                id: worker.id,
                name: worker.name,
                jobRole: worker.jobRole || "OTHER",
                checkIn: today?.checkIn,
              }
            : null
        }
        date={new Date().toISOString().split("T")[0]}
        onSubmit={handleCheckOut}
        loading={checkingOut}
      />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof UserCircle;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-outline-variant/30 p-3",
        highlight && "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="text-sm font-semibold break-words">{value}</p>
      </div>
    </div>
  );
}
