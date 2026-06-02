"use client";

import type { LucideIcon } from "lucide-react";

export function StatsRow({
  items,
}: {
  items: { label: string; value: string; icon: LucideIcon; color?: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="glass-card heat-glow min-w-0 overflow-hidden rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color || "bg-primary-container/20 text-primary"}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-on-surface-variant">{item.label}</p>
                <p className="font-display text-lg font-bold leading-tight break-words text-on-surface sm:text-xl" title={item.value}>
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
