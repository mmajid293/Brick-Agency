"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { WorkersGroupView } from "@/components/workers/workers-group-view";
import { isValidGroupKey, normalizeGroupKey } from "@/lib/work-group-meta";

export default function WorkersGroupPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = use(params);
  if (!isValidGroupKey(role)) notFound();
  return <WorkersGroupView categoryCode={normalizeGroupKey(role)} />;
}
