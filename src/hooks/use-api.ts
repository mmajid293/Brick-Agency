"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

export function useApi<T>() {
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async (
      url: string,
      options?: RequestInit & { successMessage?: string; silent?: boolean }
    ): Promise<ApiResult<T>> => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          credentials: "include",
          headers: { "Content-Type": "application/json", ...options?.headers },
          ...options,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          const msg = json.error || "Request failed";
          if (!options?.silent) toast.error(msg);
          return { success: false, error: msg };
        }
        if (options?.successMessage) toast.success(options.successMessage);
        return { success: true, data: json.data as T };
      } catch {
        const msg = "Network error";
        if (!options?.silent) toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { request, loading };
}

export async function downloadExport(module: string, format: "pdf" | "xlsx" = "xlsx") {
  const res = await fetch(`/api/reports/export?type=${module}&format=${format}`, {
    credentials: "include",
  });
  if (!res.ok) {
    toast.error("Export failed");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${module}-report.${format === "pdf" ? "pdf" : "xlsx"}`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Export downloaded");
}
