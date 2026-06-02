"use client";

import { AgencyListPage } from "@/components/agency/agency-list-page";

export default function SalesAgentsPage() {
  return (
    <AgencyListPage
      title="Sales Agents"
      titleUr="سیلز ایجنٹ"
      apiPath="/api/agents"
      minRole="MANAGER"
      fields={[
        { key: "code", label: "Agent code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "phone", label: "Phone", required: true },
        { key: "commissionPct", label: "Commission %", type: "number" },
      ]}
      columns={[
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        {
          key: "commissionPct",
          label: "Commission %",
          render: (r) => String(r.commissionPct),
        },
        {
          key: "_count",
          label: "Customers",
          render: (r) => String((r._count as { customers?: number })?.customers ?? 0),
        },
      ]}
    />
  );
}
