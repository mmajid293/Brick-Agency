"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { UsersAdmin } from "@/components/settings/users-admin";
import { useApp } from "@/context/app-context";
import { useUserRole } from "@/context/role-context";
import { useTheme } from "next-themes";
import { Globe, Database } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { locale, setLocale, translate } = useApp();
  const { theme } = useTheme();
  const role = useUserRole();
  const isAdmin = role === "ADMIN";

  return (
    <div className="easy-page space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">{translate("settings")}</h1>
        <p className="text-on-surface-variant">
          {locale === "ur" ? "زبان، تھیم، پاس ورڈ" : "Language, theme, password, users"}
        </p>
      </div>

      <ChangePasswordForm />

      {isAdmin && <UsersAdmin />}

      {isAdmin && (
        <Card className="heat-glow">
          <CardHeader>
            <CardTitle>{locale === "ur" ? "سرگرمی لاگ" : "Activity log"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/audit">
              <Button variant="outline" className="w-full sm:w-auto">
                {locale === "ur" ? "لاگ دیکھیں" : "View audit log"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="heat-glow">
        <CardHeader>
          <CardTitle>{translate("language")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant={locale === "en" ? "default" : "outline"} onClick={() => setLocale("en")}>
            <Globe className="mr-2 h-4 w-4" /> English
          </Button>
          <Button
            variant={locale === "ur" ? "default" : "outline"}
            onClick={() => setLocale("ur")}
            className="font-urdu"
          >
            اردو
          </Button>
        </CardContent>
      </Card>

      <Card className="heat-glow">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <ThemeToggle />
          <p className="text-sm text-on-surface-variant">
            {locale === "ur" ? "موجودہ" : "Current"}:{" "}
            <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
          </p>
        </CardContent>
      </Card>

      <Card className="heat-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-on-surface-variant">
          <p>
            Setup: <code className="rounded bg-surface-container px-2 py-1">npm run db:setup</code>
          </p>
          <p>PostgreSQL on localhost:5434</p>
        </CardContent>
      </Card>
    </div>
  );
}
