"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/context/app-context";

type Props = {
  title: string;
  titleUrdu?: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
  fetchUrl?: string;
  onData?: (data: unknown) => void;
};

export function ModuleShell({
  title,
  titleUrdu,
  subtitle,
  action,
  children,
  fetchUrl,
  onData,
}: Props) {
  const { locale } = useApp();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!fetchUrl);

  useEffect(() => {
    if (!fetchUrl || !onData) return;
    fetch(fetchUrl)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) onData(res.data);
        else setError(res.error || "Failed to load data");
      })
      .catch(() => setError("Database unavailable. Run: npm run db:setup"))
      .finally(() => setLoading(false));
  }, [fetchUrl, onData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brick">
            {locale === "ur" && titleUrdu ? titleUrdu : title}
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </div>
      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </CardContent>
        </Card>
      )}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
