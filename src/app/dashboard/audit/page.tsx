"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/easy/page-header";
import { useApp } from "@/context/app-context";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";

type AuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string };
};
 
export default function AuditPage() {
  const { locale } = useApp();
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs?limit=150", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLogs(json.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="easy-page space-y-6">
      <PageHeader
        title="Activity log"
        titleUr="سرگرمی لاگ"
        hint="Who changed workers, users, and other records."
        hintUr="کس نے کیا تبدیل کیا — مکمل ریکارڈ۔"
      />
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {locale === "ur" ? "حالیہ سرگرمیاں" : "Recent activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : logs.length === 0 ? (
            <p className="text-center text-on-surface-variant">
              {locale === "ur" ? "ابھی کوئی لاگ نہیں" : "No activity logged yet"}
            </p>
          ) : (
            <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-lg border border-outline-variant/30 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-xs text-on-surface-variant">
                      {formatDate(log.createdAt)}{" "}
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 font-medium">
                    {log.entity}
                    {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
                  </p>
                  {log.details && (
                    <p className="text-on-surface-variant">{log.details}</p>
                  )}
                  <p className="text-xs text-primary">
                    {log.user.name} ({log.user.role}) — {log.user.email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
