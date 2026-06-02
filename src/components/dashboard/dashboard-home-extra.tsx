"use client";

import { QuickActions } from "@/components/easy/quick-actions";
import { HelpTip } from "@/components/easy/help-tip";
import { useApp } from "@/context/app-context";

export function DashboardHomeExtra() {
  const { translate, locale } = useApp();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="w-full max-w-xl">
        <HelpTip childrenUr={translate("needHelp")}>{translate("needHelp")}</HelpTip>
      </div>
      <QuickActions />
      <p className="max-w-md text-center text-sm text-on-surface-variant">
        {locale === "ur"
          ? "بائیں مینو سے کوئی بھی سیکشن کھولیں — ہر صفحے پر ہدایات لکھی ہیں۔"
          : "Open any section from the left menu — each page has simple instructions."}
      </p>
    </div>
  );
}
