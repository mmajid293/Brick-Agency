"use client";

import { Badge } from "@/components/ui/badge";
import { categoryLabel, wageTypeLabel } from "@/lib/worker-categories";
import { departmentLabel } from "@/lib/departments";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

type Props = {
  categoryCode?: string | null;
  departmentCode?: string | null;
  wageType?: string | null;
  className?: string;
};

export function WorkerCategoryBadge({ categoryCode, departmentCode, wageType, className }: Props) {
  const { locale } = useApp();
  if (!categoryCode && !departmentCode) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {categoryCode && (
        <Badge variant="secondary" className="font-medium">
          {categoryLabel(categoryCode, locale)}
        </Badge>
      )}
      {departmentCode && (
        <Badge variant="outline" className="text-xs">
          {departmentLabel(departmentCode, locale)}
        </Badge>
      )}
      {wageType && (
        <Badge variant="outline" className="border-primary/30 text-xs text-primary">
          {wageTypeLabel(wageType, locale)}
        </Badge>
      )}
    </div>
  );
}
