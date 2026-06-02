"use client";

import { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";
import { WorkGroupHub } from "@/components/work-groups/work-group-hub";
import { PageHeader } from "@/components/easy/page-header";
import { useApp } from "@/context/app-context";
import { formatDate } from "@/lib/utils";

function AttendanceHubContent() {
  const { locale } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Attendance"
        titleUr="حاضری"
        hint={
          locale === "ur"
            ? "پہلے کام کا گروپ منتخب کریں"
            : "Choose a work group, then mark check-in / check-out"
        }
        hintUr="پہلے کام کا گروپ منتخب کریں"
      />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container/40 p-4">
        <label className="text-sm font-medium">{locale === "ur" ? "تاریخ" : "Date"}</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 w-auto"
        />
        <span className="text-sm text-on-surface-variant">{formatDate(date)}</span>
      </div>
      <WorkGroupHub module="attendance" date={date} hideHeader />
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-on-surface-variant">Loading…</div>}>
      <AttendanceHubContent />
    </Suspense>
  );
}
