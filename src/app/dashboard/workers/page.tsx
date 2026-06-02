"use client";

import { useState } from "react";
import { WorkGroupHub } from "@/components/work-groups/work-group-hub";
import { WorkforceOverview } from "@/components/workers/workforce-overview";
import { DEPARTMENTS } from "@/lib/departments";
import { useApp } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WorkersPage() {
  const { locale } = useApp();
  const [department, setDepartment] = useState<string | undefined>();

  return (
    <div className="easy-page space-y-8">
      <WorkforceOverview />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={!department ? "default" : "outline"}
          onClick={() => setDepartment(undefined)}
        >
          {locale === "ur" ? "تمام" : "All departments"}
        </Button>
        {DEPARTMENTS.map((d) => (
          <Button
            key={d.code}
            size="sm"
            variant={department === d.code ? "default" : "outline"}
            className={cn(department === d.code && "ring-2 ring-primary/30")}
            onClick={() => setDepartment(d.code)}
          >
            {locale === "ur" ? d.nameUr : d.nameEn}
          </Button>
        ))}
      </div>
      <WorkGroupHub module="workers" departmentFilter={department} showEmpty />
    </div>
  );
}
