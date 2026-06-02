"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/app-context";
import { useApi } from "@/hooks/use-api";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import type { Role } from "@prisma/client";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  workerId: string | null;
  worker: { name: string; workerCode: string | null } | null;
};

type WorkerOpt = { id: string; name: string; workerCode: string | null };

const ROLES: Role[] = ["ADMIN"];

export function UsersAdmin() {
  const { locale } = useApp();
  const { request, loading } = useApi();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [workers, setWorkers] = useState<WorkerOpt[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "SUPERVISOR" as Role,
    workerId: "",
  });

  const load = useCallback(async () => {
    const [uRes, wRes] = await Promise.all([
      fetch("/api/users", { credentials: "include" }),
      fetch("/api/workers?limit=100", { credentials: "include" }),
    ]);
    const uJson = await uRes.json();
    const wJson = await wRes.json();
    if (uJson.success) setUsers(uJson.data);
    if (wJson.success) setWorkers(wJson.data.items ?? wJson.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ email: "", password: "", name: "", role: "SUPERVISOR", workerId: "" });
    setOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setForm({
      email: u.email,
      password: "",
      name: u.name,
      role: u.role,
      workerId: u.workerId ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (editing) {
      const body: Record<string, unknown> = {
        name: form.name,
        role: form.role,
        workerId: form.workerId || null,
      };
      if (form.password) body.password = form.password;
      const res = await request(`/api/users/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        successMessage: "User updated",
      });
      if (res.success) {
        setOpen(false);
        load();
      }
    } else {
      const res = await request("/api/users", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
          workerId: form.workerId || null,
        }),
        successMessage: "User created",
      });
      if (res.success) {
        setOpen(false);
        load();
      }
    }
  };

  const remove = async (u: UserRow) => {
    if (!confirm(locale === "ur" ? `حذف ${u.email}?` : `Delete ${u.email}?`)) return;
    const res = await request(`/api/users/${u.id}`, {
      method: "DELETE",
      successMessage: "User deleted",
    });
    if (res.success) load();
  };

  return (
    <Card className="heat-glow">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {locale === "ur" ? "صارفین (لاگ ان)" : "System users"}
        </CardTitle>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {locale === "ur" ? "نیا صارف" : "Add user"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-on-surface-variant">
          {locale === "ur"
            ? "WORKER کے لیے مزدور سے جوڑیں تاکہ پورٹل کام کرے۔"
            : "Link WORKER role to a worker record for portal access."}
        </p>
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/40 p-3"
          >
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-on-surface-variant">{u.email}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge>{u.role}</Badge>
                {!u.isActive && <Badge variant="outline">Inactive</Badge>}
                {u.worker && (
                  <Badge variant="secondary">
                    {u.worker.workerCode} — {u.worker.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(u)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? locale === "ur"
                  ? "صارف تبدیل"
                  : "Edit user"
                : locale === "ur"
                  ? "نیا صارف"
                  : "New user"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!editing && (
              <>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{locale === "ur" ? "پاس ورڈ" : "Password"}</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </>
            )}
            <div>
              <Label>{locale === "ur" ? "نام" : "Name"}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>{locale === "ur" ? "کردار" : "Role"}</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{locale === "ur" ? "مزدور (پورٹل)" : "Linked worker (portal)"}</Label>
              <Select
                value={form.workerId || "_none"}
                onValueChange={(v) => setForm({ ...form, workerId: v === "_none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">
                    {locale === "ur" ? "کوئی نہیں" : "None"}
                  </SelectItem>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} {w.workerCode ? `(${w.workerCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editing && (
              <div>
                <Label>{locale === "ur" ? "نیا پاس ورڈ (اختیاری)" : "New password (optional)"}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
            <Button onClick={save} disabled={loading} className="w-full">
              {locale === "ur" ? "محفوظ" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
