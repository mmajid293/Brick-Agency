"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WriteGuard } from "@/components/crud/write-guard";
import { formatPKR, formatDate } from "@/lib/utils";
import { attendanceStatusLabel } from "@/lib/attendance-status";
import { workerJobRoleLabel } from "@/lib/worker-roles";
import { useApp } from "@/context/app-context";
import { Banknote, Pencil, ClipboardCheck, User } from "lucide-react";

type WorkerSummary = {
  id: string;
  workerCode: string | null;
  name: string;
  nameUrdu?: string | null;
  fatherName?: string | null;
  cnic: string;
  phone: string;
  address: string;
  department: string;
  jobRole?: string;
  workDescription?: string | null;
  standardHoursPerDay?: string | number;
  shiftStart?: string | null;
  bricksTargetPerDay?: number | null;
  dailyWage: string | number;
  perBrickRate?: string | number;
  advanceBalance?: string | number;
  isActive: boolean;
  imageUrl?: string | null;
  joinDate?: string;
};

type WorkerDetail = WorkerSummary & {
  attendances?: {
    id: string;
    date: string;
    status: string;
    regularHours?: string | number;
    extraHours?: string | number;
    bricksProduced?: number | null;
  }[];
  advances?: { id: string; amount: string | number; date: string; reason?: string | null }[];
  payrolls?: {
    id: string;
    month: number;
    year: number;
    netPay: string | number;
    isPaid: boolean;
  }[];
  transactions?: { id: string; amount: string | number; date: string; description?: string | null }[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerSummary | null;
  detail: WorkerDetail | null;
  onEdit?: () => void;
  onAdvance?: () => void;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container/40 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-1 text-base font-semibold text-on-surface">{value}</p>
    </div>
  );
}

export function WorkerDetailDialog({
  open,
  onOpenChange,
  worker,
  detail,
  onEdit,
  onAdvance,
}: Props) {
  const { locale } = useApp();
  const data = detail ?? worker;
  if (!data) return null;

  const attendances = detail?.attendances ?? [];
  const advances = detail?.advances ?? [];
  const payrolls = detail?.payrolls ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-xl">
            <User className="h-6 w-6 text-primary" />
            {data.name}
            <Badge variant={data.isActive ? "default" : "outline"}>
              {data.isActive ? (locale === "ur" ? "فعال" : "Active") : locale === "ur" ? "بند" : "Inactive"}
            </Badge>
          </DialogTitle>
          {data.nameUrdu && <p className="font-urdu text-lg text-on-surface-variant">{data.nameUrdu}</p>}
        </DialogHeader>

        <div className="space-y-6">
          {data.imageUrl && (
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-primary/30">
              <Image src={data.imageUrl} alt="" fill className="object-cover" />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <WriteGuard minRole="SUPERVISOR">
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Pencil className="mr-1 h-4 w-4" />
                  {locale === "ur" ? "تبدیلی" : "Edit"}
                </Button>
              )}
              {onAdvance && (
                <Button size="sm" variant="outline" onClick={onAdvance}>
                  <Banknote className="mr-1 h-4 w-4" />
                  {locale === "ur" ? "پیشگی" : "Advance"}
                </Button>
              )}
            </WriteGuard>
            <Link href={`/dashboard/attendance?date=${new Date().toISOString().split("T")[0]}`}>
              <Button size="sm" variant="secondary">
                <ClipboardCheck className="mr-1 h-4 w-4" />
                {locale === "ur" ? "حاضری" : "Attendance"}
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label={locale === "ur" ? "کوڈ" : "Worker code"} value={data.workerCode ?? "—"} />
            <InfoRow
              label={locale === "ur" ? "کام" : "Job role"}
              value={
                data.jobRole
                  ? workerJobRoleLabel(data.jobRole, locale === "ur" ? "ur" : "en")
                  : data.department
              }
            />
            <InfoRow label={locale === "ur" ? "شعبہ" : "Department"} value={data.department} />
            {data.workDescription && (
              <InfoRow
                label={locale === "ur" ? "تفصیل" : "Work details"}
                value={<span className="text-sm font-normal">{data.workDescription}</span>}
              />
            )}
            <InfoRow
              label={locale === "ur" ? "روزانہ گھنٹے" : "Standard hours"}
              value={`${Number(data.standardHoursPerDay ?? 8)}h`}
            />
            {data.shiftStart && (
              <InfoRow label={locale === "ur" ? "شفٹ" : "Shift"} value={data.shiftStart} />
            )}
            {data.bricksTargetPerDay != null && (
              <InfoRow
                label={locale === "ur" ? "ہدف اینٹ" : "Brick target / day"}
                value={String(data.bricksTargetPerDay)}
              />
            )}
            <InfoRow label="CNIC" value={data.cnic} />
            <InfoRow label={locale === "ur" ? "فون" : "Phone"} value={data.phone} />
            <InfoRow
              label={locale === "ur" ? "والد کا نام" : "Father name"}
              value={data.fatherName || "—"}
            />
            <InfoRow
              label={locale === "ur" ? "روزانہ اجرت" : "Daily wage"}
              value={formatPKR(Number(data.dailyWage))}
            />
            <InfoRow
              label={locale === "ur" ? "فی اینٹ" : "Per brick rate"}
              value={formatPKR(Number(data.perBrickRate ?? 0))}
            />
            <InfoRow
              label={locale === "ur" ? "پیشگی بقایا" : "Advance balance"}
              value={formatPKR(Number(data.advanceBalance ?? 0))}
            />
            <InfoRow
              label={locale === "ur" ? "پتہ" : "Address"}
              value={<span className="text-sm font-normal">{data.address}</span>}
            />
            {data.joinDate && (
              <InfoRow
                label={locale === "ur" ? "شمولیت" : "Join date"}
                value={formatDate(data.joinDate)}
              />
            )}
          </div>

          <section>
            <h4 className="mb-2 font-display text-lg font-semibold">
              {locale === "ur" ? "حاضری (حالیہ)" : "Recent attendance"}
            </h4>
            {attendances.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {locale === "ur" ? "کوئی ریکارڈ نہیں" : "No records yet"}
              </p>
            ) : (
              <ul className="space-y-2">
                {attendances.slice(0, 10).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-outline-variant/30 px-3 py-2 text-sm"
                  >
                    <span>
                      {formatDate(a.date)}
                      {(Number(a.regularHours) > 0 || Number(a.extraHours) > 0) && (
                        <span className="ml-2 text-on-surface-variant">
                          {Number(a.regularHours)}h
                          {Number(a.extraHours) > 0 ? ` +${Number(a.extraHours)} extra` : ""}
                          {a.bricksProduced != null ? ` · ${a.bricksProduced} bricks` : ""}
                        </span>
                      )}
                    </span>
                    <Badge variant="outline">{attendanceStatusLabel(a.status, locale)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="mb-2 font-display text-lg font-semibold">
              {locale === "ur" ? "پیشگی" : "Advances"}
            </h4>
            {advances.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {locale === "ur" ? "کوئی پیشگی نہیں" : "No advances"}
              </p>
            ) : (
              <ul className="space-y-2">
                {advances.slice(0, 8).map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between rounded-lg border border-outline-variant/30 px-3 py-2 text-sm"
                  >
                    <span>{formatDate(a.date)}</span>
                    <span className="font-semibold text-amber-700">
                      {formatPKR(Number(a.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="mb-2 font-display text-lg font-semibold">
              {locale === "ur" ? "تنخواہ" : "Payroll"}
            </h4>
            {payrolls.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                {locale === "ur" ? "کوئی تنخواہ نہیں" : "No payroll yet"}
              </p>
            ) : (
              <ul className="space-y-2">
                {payrolls.slice(0, 6).map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between rounded-lg border border-outline-variant/30 px-3 py-2 text-sm"
                  >
                    <span>
                      {p.month}/{p.year}
                    </span>
                    <span>
                      {formatPKR(Number(p.netPay))}{" "}
                      {p.isPaid ? "✓" : locale === "ur" ? "(باقی)" : "(pending)"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
