"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModuleToolbar } from "@/components/crud/module-toolbar";
import { WriteGuard } from "@/components/crud/write-guard";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { Pagination } from "@/components/crud/pagination";
import { PageHeader } from "@/components/easy/page-header";
import { WorkerDetailDialog } from "@/components/workers/worker-detail-dialog";
import { workerSchema } from "@/lib/validations";
import { useApi, downloadExport } from "@/hooks/use-api";
import { useApp } from "@/context/app-context";
import { categoryByCode, categoryLabel, wageTypeLabel, shiftTypeLabel } from "@/lib/worker-categories";
import { departmentLabel } from "@/lib/departments";
import { workGroupMeta } from "@/lib/work-group-meta";
import { WorkerCategoryBadge } from "@/components/workers/worker-category-badge";
import { formatPKR, cn } from "@/lib/utils";
import type { WorkerCategoryCode } from "@/lib/worker-categories";
import { ArrowLeft, ChevronRight, Pencil, Trash2, Users } from "lucide-react";

const formSchema = workerSchema;

interface Worker {
  id: string;
  workerCode: string;
  name: string;
  nameUrdu: string | null;
  fatherName: string | null;
  cnic: string;
  phone: string;
  address: string;
  department: string;
  jobRole: string;
  dailyWage: string | number;
  perBrickRate: string | number;
  advanceBalance: string | number;
  isActive: boolean;
}

export function WorkersGroupView({ categoryCode }: { categoryCode: WorkerCategoryCode }) {
  const { locale } = useApp();
  const catDef = categoryByCode(categoryCode)!;
  const meta = workGroupMeta(categoryCode);
  const Icon = meta.icon;
  const { request, loading: apiLoading } = useApi();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [page, setPage] = useState(1);
  const [metaPage, setMetaPage] = useState({ total: 0, totalPages: 1 });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameUrdu: "",
      cnic: "",
      phone: "",
      address: "",
      categoryCode,
      department: departmentLabel(catDef.departmentCode, "en"),
      jobRole: catDef.legacyJobRole,
      wageType: catDef.wageType,
      shiftType: catDef.defaultShift,
      skillLevel: "SKILLED",
      dailyTarget: catDef.defaultTarget,
      monthlySalary: catDef.defaultMonthly,
      perTruckRate: catDef.defaultPerTruck,
      dailyWage: catDef.defaultDailyWage,
      perBrickRate: catDef.defaultPerBrick,
      standardHoursPerDay: 8,
      shiftStart: "06:00",
      isActive: true,
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("category", categoryCode);
    if (search) params.set("search", search);
    const res = await fetch(`/api/workers?${params}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setWorkers(json.data.items ?? json.data);
      if (json.data.meta) setMetaPage(json.data.meta);
    }
    setLoading(false);
  }, [search, page, categoryCode]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      nameUrdu: "",
      cnic: "",
      phone: "",
      address: "",
      categoryCode,
      department: departmentLabel(catDef.departmentCode, "en"),
      jobRole: catDef.legacyJobRole,
      wageType: catDef.wageType,
      shiftType: catDef.defaultShift,
      skillLevel: "SKILLED",
      dailyTarget: catDef.defaultTarget,
      monthlySalary: catDef.defaultMonthly,
      perTruckRate: catDef.defaultPerTruck,
      dailyWage: catDef.defaultDailyWage,
      perBrickRate: catDef.defaultPerBrick,
      standardHoursPerDay: 8,
      shiftStart: "06:00",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (w: Worker) => {
    setEditing(w);
    form.reset({
      name: w.name,
      nameUrdu: w.nameUrdu ?? "",
      fatherName: w.fatherName ?? "",
      cnic: w.cnic,
      phone: w.phone,
      address: w.address,
      dailyWage: Number(w.dailyWage),
      perBrickRate: Number(w.perBrickRate),
      categoryCode,
      department: departmentLabel(catDef.departmentCode, "en"),
      jobRole: catDef.legacyJobRole,
      wageType: catDef.wageType,
      shiftType: catDef.defaultShift,
      skillLevel: "SKILLED",
      dailyTarget: catDef.defaultTarget,
      monthlySalary: catDef.defaultMonthly,
      perTruckRate: catDef.defaultPerTruck,
      standardHoursPerDay: 8,
      shiftStart: "06:00",
      isActive: w.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      categoryCode,
      jobRole: catDef.legacyJobRole,
      department: departmentLabel(catDef.departmentCode, "en"),
    };
    const url = editing ? `/api/workers/${editing.id}` : "/api/workers";
    const res = await request(url, {
      method: editing ? "PATCH" : "POST",
      body: JSON.stringify(payload),
      successMessage: editing
        ? locale === "ur"
          ? "مزدور اپ ڈیٹ"
          : "Worker updated"
        : locale === "ur"
          ? "مزدور شامل"
          : "Worker added",
    });
    if (res.success) {
      setDialogOpen(false);
      load();
    }
  });

  const onDelete = async () => {
    if (!selected) return;
    const res = await request(`/api/workers/${selected.id}`, {
      method: "DELETE",
      successMessage: locale === "ur" ? "مزدور حذف" : "Worker deleted",
    });
    if (res.success) {
      setDeleteOpen(false);
      setSelected(null);
      load();
    }
  };

  const viewDetail = async (w: Worker) => {
    setSelected(w);
    const res = await fetch(`/api/workers/${w.id}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) setDetail(json.data);
    setDetailOpen(true);
  };

  const title = categoryLabel(categoryCode, locale);
  const dept = departmentLabel(catDef.departmentCode, locale);

  return (
    <div className="easy-page space-y-6">
      <Link href="/dashboard/workers">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {locale === "ur" ? "تمام گروپ" : "All work groups"}
        </Button>
      </Link>

      <PageHeader
        title={title}
        titleUr={title}
        hint={locale === "ur" ? meta.workHintUr : meta.workHintEn}
        hintUr={meta.workHintUr}
      />

      <Card className={cn("glass-card border-2", meta.border)}>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
              meta.gradient
            )}
          >
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold text-on-surface">{title}</p>
            <p className="text-sm text-on-surface-variant">{dept}</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {locale === "ur" ? meta.workHintUr : meta.workHintEn}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container/50 px-4 py-2">
            <Users className="h-5 w-5 text-primary" />
            <div className="text-right">
              <p className="text-2xl font-bold leading-none">{metaPage.total || workers.length}</p>
              <p className="text-xs text-on-surface-variant">
                {locale === "ur" ? "مزدور" : "Workers"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WriteGuard minRole="MANAGER">
        <ModuleToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onAdd={openCreate}
          onExport={() => downloadExport("workers", "xlsx")}
          addLabel={locale === "ur" ? "نیا مزدور" : "Add worker"}
          placeholder={locale === "ur" ? "نام یا فون..." : "Name or phone..."}
          minRole="MANAGER"
        />
      </WriteGuard>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>
            {title} ({metaPage.total || workers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {locale === "ur" ? "اس گروپ میں کوئی مزدور نہیں" : "No workers in this group yet"}
            </p>
          ) : (
            <div className="space-y-1">
              {workers.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-2 rounded-md border-b border-brick/5 px-1 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{w.name}</p>
                      {!w.isActive && (
                        <Badge variant="outline" className="text-xs">
                          {locale === "ur" ? "غیر فعال" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                    {w.nameUrdu && (
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {w.nameUrdu}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {w.workerCode} · {w.cnic} · {w.phone}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      {formatPKR(Number(w.dailyWage))}
                      {locale === "ur" ? " / دن" : " / day"}
                      {Number(w.advanceBalance) > 0 && (
                        <span className="ml-2 text-amber-700">
                          · {locale === "ur" ? "سلف" : "Advance"}{" "}
                          {formatPKR(Number(w.advanceBalance))}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => viewDetail(w)}
                      title={locale === "ur" ? "تفصیل" : "View"}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <WriteGuard minRole="MANAGER">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(w)}
                        title={locale === "ur" ? "تبدیل" : "Edit"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelected(w);
                          setDeleteOpen(true);
                        }}
                        title={locale === "ur" ? "حذف" : "Delete"}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </WriteGuard>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={metaPage.totalPages}
            total={metaPage.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? locale === "ur"
                  ? "مزدور تبدیل"
                  : "Edit worker"
                : locale === "ur"
                  ? "نیا مزدور"
                  : "Add worker"}{" "}
              — {title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>{locale === "ur" ? "نام *" : "Name *"}</Label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>{locale === "ur" ? "نام (اردو)" : "Name (Urdu)"}</Label>
              <Input {...form.register("nameUrdu")} dir="rtl" />
            </div>
            <div className="space-y-1">
              <Label>{locale === "ur" ? "شناختی کارڈ *" : "CNIC *"}</Label>
              <Input {...form.register("cnic")} placeholder="35202-1234567-1" />
              {form.formState.errors.cnic && (
                <p className="text-xs text-red-500">{form.formState.errors.cnic.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>{locale === "ur" ? "فون *" : "Phone *"}</Label>
              <Input {...form.register("phone")} placeholder="03001234567" />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>{locale === "ur" ? "پتہ *" : "Address *"}</Label>
              <Input {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div className="rounded-lg border border-outline-variant/30 bg-surface-container/30 p-3 sm:col-span-2">
              <WorkerCategoryBadge
                categoryCode={categoryCode}
                departmentCode={catDef.departmentCode}
                wageType={catDef.wageType}
              />
            </div>
            {(catDef.wageType === "DAILY" || catDef.wageType === "SHIFT") && (
              <div className="space-y-1">
                <Label>{locale === "ur" ? "روزانہ اجرت *" : "Daily wage *"}</Label>
                <Input type="number" {...form.register("dailyWage", { valueAsNumber: true })} />
              </div>
            )}
            {catDef.wageType === "MONTHLY" && (
              <div className="space-y-1">
                <Label>{locale === "ur" ? "ماہانہ تنخواہ" : "Monthly salary"}</Label>
                <Input type="number" {...form.register("monthlySalary", { valueAsNumber: true })} />
              </div>
            )}
            {catDef.wageType === "PER_THOUSAND_BRICKS" && (
              <>
                <div className="space-y-1">
                  <Label>{locale === "ur" ? "فی ہزار اینٹ" : "Per 1000 bricks (PKR)"}</Label>
                  <Input type="number" step="0.01" {...form.register("perBrickRate", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1">
                  <Label>{locale === "ur" ? "روزانہ ہدف" : "Daily target"}</Label>
                  <Input type="number" {...form.register("dailyTarget", { valueAsNumber: true })} />
                </div>
              </>
            )}
            {catDef.wageType === "PER_TRUCK" && (
              <div className="space-y-1">
                <Label>{locale === "ur" ? "فی ٹرک" : "Per truck (PKR)"}</Label>
                <Input type="number" {...form.register("perTruckRate", { valueAsNumber: true })} />
              </div>
            )}
            <div className="space-y-1 sm:col-span-2">
              <Label>{locale === "ur" ? "کام کی تفویض" : "Production assignment"}</Label>
              <Input {...form.register("productionAssignment")} />
            </div>
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit" disabled={apiLoading}>
                {locale === "ur" ? "محفوظ" : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {locale === "ur" ? "منسوخ" : "Cancel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <WorkerDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        worker={selected}
        detail={detail as Parameters<typeof WorkerDetailDialog>[0]["detail"]}
        onEdit={() => {
          if (selected) {
            setDetailOpen(false);
            openEdit(selected);
          }
        }}
        onAdvance={() => {}}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={locale === "ur" ? "مزدور حذف؟" : "Delete worker?"}
        description={selected?.name ?? ""}
        onConfirm={onDelete}
        loading={apiLoading}
      />
    </div>
  );
}

