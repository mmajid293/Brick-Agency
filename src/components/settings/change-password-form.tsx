"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/app-context";
import { Lock } from "lucide-react";

export function ChangePasswordForm() {
  const { locale } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (newPassword !== confirm) {
      setError(locale === "ur" ? "نئے پاس ورڈ میل نہیں کھاتے" : "New passwords do not match");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setMsg(locale === "ur" ? "پاس ورڈ بدل گیا" : "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } else {
      setError(json.error ?? "Failed");
    }
  };

  return (
    <Card className="heat-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {locale === "ur" ? "پاس ورڈ بدلیں" : "Change password"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="easy-page max-w-md space-y-3">
          <div>
            <Label>{locale === "ur" ? "پرانا پاس ورڈ" : "Current password"}</Label>
            <Input
              type="password"
              className="h-12"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>{locale === "ur" ? "نیا پاس ورڈ" : "New password"}</Label>
            <Input
              type="password"
              className="h-12"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <Label>{locale === "ur" ? "نیا پاس ورڈ دوبارہ" : "Confirm new password"}</Label>
            <Input
              type="password"
              className="h-12"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {msg && <p className="text-sm text-green-700">{msg}</p>}
          <Button type="submit" className="easy-btn-lg" disabled={loading}>
            {loading
              ? locale === "ur"
                ? "محفوظ ہو رہا ہے…"
                : "Saving…"
              : locale === "ur"
                ? "محفوظ کریں"
                : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
