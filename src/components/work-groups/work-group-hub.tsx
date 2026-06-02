"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/easy/page-header";
import { HelpTip } from "@/components/easy/help-tip";
import { WorkGroupGrid, type WorkGroupSummary } from "@/components/work-groups/work-group-grid";
import { useApp } from "@/context/app-context";

type Props = {
  module: "workers" | "attendance";
  date?: string;
  hideHeader?: boolean;
  departmentFilter?: string;
  showEmpty?: boolean;
};

export function WorkGroupHub({ module, date, hideHeader, departmentFilter, showEmpty }: Props) {
  const { locale } = useApp();
  const [summaries, setSummaries] = useState<WorkGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (departmentFilter) params.set("department", departmentFilter);
    const q = params.toString() ? `?${params}` : "";
    const res = await fetch(`/api/work-groups/summary${q}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setSummaries(json.data.groups);
    } else {
      setError(json.error ?? "Failed to load");
    }
    setLoading(false);
  }, [date, departmentFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const titleEn = module === "workers" ? "Workers by work group" : "Attendance by work group";
  const titleUr = module === "workers" ? "کام کے گروپ — مزدور" : "کام کے گروپ — حاضری";
  const hintEn =
    module === "workers"
      ? "Each card is a work type (molding, kiln, loader…). Open a group to manage those workers."
      : "Pick a work group to check in/out and record daily work for that team.";
  const hintUr =
    module === "workers"
      ? "ہر کارڈ ایک کام کا گروپ ہے — کھولیں اور مزدور دیکھیں/شامل کریں"
      : "گروپ کھولیں — اس ٹیم کی حاضری اور کام کی رپورٹ";

  return (
    <div className={hideHeader ? "space-y-4" : "easy-page space-y-6"}>
      {!hideHeader && (
        <>
          <PageHeader title={titleEn} titleUr={titleUr} hint={hintEn} hintUr={hintUr} />
          <HelpTip
            children={
              <>
                <strong>{locale === "ur" ? "کیسے استعمال کریں" : "How to use"}</strong>
                {" — "}
                Click a card — you will only see workers for that work type.
              </>
            }
            childrenUr={
              <>
                <strong>کیسے استعمال کریں</strong>
                {" — "}
                کارڈ پر کلک کریں — صرف اسی کام کے مزدور نظر آئیں گے۔
              </>
            }
          />
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <WorkGroupGrid
        summaries={summaries}
        loading={loading}
        module={module}
        date={date}
        showEmpty={showEmpty}
      />
    </div>
  );
}
