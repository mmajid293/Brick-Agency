"use client";

import { Info } from "lucide-react";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

export function HelpTip({
  children,
  childrenUr,
  className,
}: {
  children: React.ReactNode;
  childrenUr?: React.ReactNode;
  className?: string;
}) {
  const { locale } = useApp();

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border-2 border-primary/20 bg-primary-container/30 p-4 text-base text-on-surface",
        className
      )}
      role="note"
    >
      <Info className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
      <div className="leading-relaxed">{locale === "ur" && childrenUr ? childrenUr : children}</div>
    </div>
  );
}
