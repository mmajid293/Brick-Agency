"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search } from "lucide-react";
import type { Role } from "@prisma/client";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onAdd?: () => void;
  onExport?: () => void;
  addLabel?: string;
  minRole?: Role;
  hideSearch?: boolean;
  hideAdd?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
};

/** Admin-only app — toolbar always shows add/export when provided. */
export function ModuleToolbar({
  search,
  onSearchChange,
  onAdd,
  onExport,
  addLabel = "Add",
  hideSearch,
  hideAdd,
  placeholder = "Search...",
  children,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {!hideSearch && (
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            className="h-11 pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      {children}
      {onExport && (
        <Button type="button" variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      )}
      {!hideAdd && onAdd && (
        <Button type="button" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
