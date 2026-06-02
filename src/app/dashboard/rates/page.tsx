"use client";

import { AgencyListPage } from "@/components/agency/agency-list-page";

export default function RateCardPage() {
  return (
    <AgencyListPage
      title="Brick Rate Card"
      titleUr="اینٹوں کی شرح نامہ"
      apiPath="/api/rate-cards"
      minRole="MANAGER"
      fields={[
        { key: "brickGrade", label: "Grade (GRADE_A, GRADE_B...)", required: true },
        { key: "customerType", label: "Customer type (optional)" },
        { key: "ratePerBrick", label: "Rate per brick (PKR)", type: "number", required: true },
        { key: "effectiveFrom", label: "Effective from (YYYY-MM-DD)", required: true },
        { key: "notes", label: "Notes" },
      ]}
      columns={[
        { key: "brickGrade", label: "Grade" },
        { key: "customerType", label: "Customer type", render: (r) => String(r.customerType ?? "All") },
        { key: "ratePerBrick", label: "Rate (PKR)", render: (r) => String(r.ratePerBrick) },
        {
          key: "effectiveFrom",
          label: "From",
          render: (r) => new Date(String(r.effectiveFrom)).toLocaleDateString(),
        },
      ]}
    />
  );
}
