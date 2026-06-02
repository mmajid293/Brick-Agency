"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Scroll to and briefly highlight a row when `?highlight=<id>` is in the URL. */
export function useHighlight(elementIdPrefix: string, deps: unknown[] = []) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`${elementIdPrefix}${highlightId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-primary", "ring-offset-2", "bg-primary/5");
    const t = setTimeout(() => {
      el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "bg-primary/5");
    }, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, elementIdPrefix, ...deps]);

  return highlightId;
}
