"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { workReportFieldsForCategory, type WorkReportData } from "@/lib/work-report";
import { useApp } from "@/context/app-context";

type WorkerInfo = {
  id: string;
  name: string;
  jobRole: string;
  category?: { code: string } | null;
  checkIn?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerInfo | null;
  date: string;
  onSubmit: (payload: {
    workerId: string;
    checkOut?: string;
    useManualTime: boolean;
    workReport: WorkReportData;
    taskCompleted: string;
    notes: string;
  }) => Promise<boolean>;
  loading?: boolean;
};

export function CheckOutDialog({
  open,
  onOpenChange,
  worker,
  date,
  onSubmit,
  loading,
}: Props) {
  const { locale } = useApp();
  const [manualTime, setManualTime] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState("");
  const [taskCompleted, setTaskCompleted] = useState("");
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState<WorkReportData>({});

  useEffect(() => {
    if (open) {
      const now = new Date();
      setCheckOutTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
      setReport({});
      setTaskCompleted("");
      setNotes("");
      setManualTime(false);
    }
  }, [open, worker?.id]);

  if (!worker) return null;

  const fields = workReportFieldsForCategory(
    worker.category?.code ?? worker.jobRole ?? "GENERAL_HELPER"
  );

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {locale === "ur" ? "چیک آؤٹ" : "Check out"} — {worker.name}
          </DialogTitle>
          <p className="text-sm text-on-surface-variant">
            {locale === "ur" ? "کام کی رپورٹ درج کریں" : "Submit today&apos;s work report"}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <p className="rounded-lg bg-green-500/10 p-3 text-sm">
            {locale === "ur" ? "چیک ان" : "Check in"}: <strong>{formatTime(worker.checkIn)}</strong>
          </p>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={manualTime}
              onChange={(e) => setManualTime(e.target.checked)}
            />
            {locale === "ur" ? "چیک آؤٹ کا وقت خود درج کریں" : "Set check-out time manually"}
          </label>
          {manualTime && (
            <div className="space-y-1">
              <Label>{locale === "ur" ? "چیک آؤٹ وقت" : "Check-out time"}</Label>
              <Input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
            </div>
          )}

          <div className="space-y-3 border-t border-outline-variant/30 pt-3">
            <p className="font-semibold text-on-surface">
              {locale === "ur" ? "آج کا کام" : "Today&apos;s work"}
            </p>
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label>{locale === "ur" ? f.labelUr : f.labelEn}</Label>
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  value={report[f.key] ?? ""}
                  onChange={(e) =>
                    setReport((prev) => ({
                      ...prev,
                      [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                    }))
                  }
                  placeholder={locale === "ur" ? f.placeholderUr : f.placeholderEn}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <Label>{locale === "ur" ? "مکمل ٹاسک" : "Tasks completed"}</Label>
            <Input
              value={taskCompleted}
              onChange={(e) => setTaskCompleted(e.target.value)}
              placeholder={locale === "ur" ? "آج کیا کیا" : "What was finished today"}
            />
          </div>
          <div className="space-y-1">
            <Label>{locale === "ur" ? "نوٹ" : "Notes"}</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={loading}
            onClick={async () => {
              const ok = await onSubmit({
                workerId: worker.id,
                checkOut: manualTime ? checkOutTime : undefined,
                useManualTime: manualTime,
                workReport: report,
                taskCompleted,
                notes,
              });
              if (ok) onOpenChange(false);
            }}
          >
            {loading
              ? locale === "ur"
                ? "محفوظ..."
                : "Saving..."
              : locale === "ur"
                ? "چیک آؤٹ محفوظ کریں"
                : "Save check-out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
