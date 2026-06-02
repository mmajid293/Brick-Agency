import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Layers,
  Flame,
  PackageOpen,
  Tractor,
  Truck,
  Fuel,
  Droplets,
  Users,
  ClipboardList,
  Wrench,
  Shield,
  Zap,
  Send,
  Sparkles,
  TreeDeciduous,
} from "lucide-react";
import {
  WORKER_CATEGORIES,
  categoryByCode,
  isValidCategoryCode,
  resolveCategoryCode,
  type WorkerCategoryCode,
} from "./worker-categories";
import { legacyRoleToCategory } from "./worker-categories";
import type { WorkerJobRole } from "@prisma/client";

const ICONS: Record<string, LucideIcon> = {
  boxes: Boxes,
  layers: Layers,
  flame: Flame,
  package: PackageOpen,
  tractor: Tractor,
  truck: Truck,
  fuel: Fuel,
  droplets: Droplets,
  users: Users,
  clipboard: ClipboardList,
  wrench: Wrench,
  shield: Shield,
  zap: Zap,
  send: Send,
  sparkles: Sparkles,
  wood: TreeDeciduous,
};

const COLOR_STYLES: Record<
  string,
  { gradient: string; border: string }
> = {
  amber: { gradient: "from-amber-500/25 to-orange-600/15", border: "border-amber-500/40" },
  stone: { gradient: "from-stone-500/25 to-stone-600/15", border: "border-stone-500/40" },
  red: { gradient: "from-red-500/25 to-rose-600/15", border: "border-red-500/40" },
  blue: { gradient: "from-blue-500/25 to-indigo-600/15", border: "border-blue-500/40" },
  green: { gradient: "from-green-500/25 to-emerald-600/15", border: "border-green-500/40" },
  indigo: { gradient: "from-indigo-500/25 to-violet-600/15", border: "border-indigo-500/40" },
  orange: { gradient: "from-orange-500/25 to-amber-600/15", border: "border-orange-500/40" },
  cyan: { gradient: "from-cyan-500/25 to-teal-600/15", border: "border-cyan-500/40" },
  slate: { gradient: "from-slate-500/25 to-gray-600/15", border: "border-slate-500/40" },
  violet: { gradient: "from-violet-500/25 to-purple-600/15", border: "border-violet-500/40" },
  zinc: { gradient: "from-zinc-500/25 to-neutral-600/15", border: "border-zinc-500/40" },
  emerald: { gradient: "from-emerald-500/25 to-green-600/15", border: "border-emerald-500/40" },
  yellow: { gradient: "from-yellow-500/25 to-amber-600/15", border: "border-yellow-500/40" },
  teal: { gradient: "from-teal-500/25 to-cyan-600/15", border: "border-teal-500/40" },
  rose: { gradient: "from-rose-500/25 to-pink-600/15", border: "border-rose-500/40" },
  lime: { gradient: "from-lime-500/25 to-emerald-600/15", border: "border-lime-500/40" },
};

export type WorkGroupMeta = {
  code: WorkerCategoryCode;
  icon: LucideIcon;
  gradient: string;
  border: string;
  workHintEn: string;
  workHintUr: string;
  wageType: string;
  attendanceMode: string;
  departmentCode: string;
};

export function workGroupMeta(code: WorkerCategoryCode): WorkGroupMeta {
  const cat = categoryByCode(code)!;
  const colors = COLOR_STYLES[cat.colorKey] ?? COLOR_STYLES.slate;
  return {
    code,
    icon: ICONS[cat.iconKey] ?? Users,
    gradient: colors.gradient,
    border: colors.border,
    workHintEn: cat.workHintEn,
    workHintUr: cat.workHintUr,
    wageType: cat.wageType,
    attendanceMode: cat.attendanceMode,
    departmentCode: cat.departmentCode,
  };
}

export function allWorkGroups() {
  return WORKER_CATEGORIES.map((c) => workGroupMeta(c.code));
}

/** Accepts category code or legacy WorkerJobRole */
export function isValidGroupKey(key: string): boolean {
  return resolveCategoryCode(key) !== null;
}

export function normalizeGroupKey(key: string): WorkerCategoryCode {
  const resolved = resolveCategoryCode(key);
  if (resolved) return resolved;
  return "GENERAL_HELPER";
}

export function isValidJobRole(key: string): boolean {
  return isValidGroupKey(key);
}

export function jobRoleToCategory(role: WorkerJobRole): WorkerCategoryCode {
  return legacyRoleToCategory(role);
}
