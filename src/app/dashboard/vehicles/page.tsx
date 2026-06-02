"use client";

import { AgencyListPage } from "@/components/agency/agency-list-page";

export default function VehiclesPage() {
  return (
    <AgencyListPage
      title="Fleet / Trucks"
      titleUr="گاڑیاں / ٹرک"
      apiPath="/api/vehicles"
      minRole="SUPERVISOR"
      fields={[
        { key: "registration", label: "Registration", required: true },
        { key: "label", label: "Label" },
        { key: "driverName", label: "Driver name", required: true },
        { key: "driverPhone", label: "Driver phone" },
        { key: "capacityBricks", label: "Capacity (bricks)", type: "number" },
      ]}
      columns={[
        { key: "registration", label: "Reg #" },
        { key: "label", label: "Label" },
        { key: "driverName", label: "Driver" },
        { key: "capacityBricks", label: "Capacity" },
        { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
      ]}
    />
  );
}
