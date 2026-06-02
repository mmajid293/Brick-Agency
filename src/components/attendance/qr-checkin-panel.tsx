"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/app-context";
import { QrCode } from "lucide-react";

type WorkerOpt = { id: string; name: string; workerCode: string | null };

type Props = {
  workers: WorkerOpt[];
  onSuccess: () => void;
};

export function QrCheckinPanel({ workers, onSuccess }: Props) {
  const { locale } = useApp();
  const [workerId, setWorkerId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const checkIn = async () => {
    if (!workerId) return;
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/attendance/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ workerId }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setMsg(
        locale === "ur"
          ? `حاضری لگ گئی: ${json.data.worker}`
          : `Checked in: ${json.data.worker}`
      );
      onSuccess();
    } else {
      setMsg(json.error ?? "Failed");
    }
  };

  return (
    <Card className="glass-card border-brick/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-5 w-5" />
          {locale === "ur" ? "QR / فوری چیک ان" : "QR quick check-in"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <select
          className="easy-tap min-h-12 flex-1 rounded-lg border border-outline-variant bg-surface px-3 text-base"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
        >
          <option value="">{locale === "ur" ? "مزدور چنیں…" : "Select worker…"}</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} {w.workerCode ? `(${w.workerCode})` : ""}
            </option>
          ))}
        </select>
        <Button size="lg" className="easy-btn-lg" onClick={checkIn} disabled={loading || !workerId}>
          {locale === "ur" ? "حاضر لگائیں" : "Check in"}
        </Button>
        {msg && <p className="w-full text-sm text-green-700">{msg}</p>}
        <p className="w-full text-xs text-on-surface-variant">
          {locale === "ur"
            ? "مزدور اپنے پورٹل پر ID دکھا سکتا ہے — سپروائزر یہاں چیک ان کرے۔"
            : "Workers show their ID on the portal — supervisor checks in here."}
        </p>
      </CardContent>
    </Card>
  );
}
