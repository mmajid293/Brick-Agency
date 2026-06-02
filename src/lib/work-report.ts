import type { WorkerJobRole } from "@prisma/client";
import {
  categoryByCode,
  legacyRoleToCategory,
  resolveCategoryCode,
  type WorkerCategoryCode,
} from "./worker-categories";

export type WorkReportField = {
  key: string;
  labelEn: string;
  labelUr: string;
  type: "number" | "text";
  placeholderEn?: string;
  placeholderUr?: string;
};

export const WORK_REPORT_FIELDS: Record<WorkerJobRole, WorkReportField[]> = {
  MOLDING: [
    {
      key: "bricksMolded",
      labelEn: "Bricks molded today",
      labelUr: "آج بنائی گئی اینٹیں",
      type: "number",
      placeholderEn: "e.g. 900",
      placeholderUr: "مثلاً 900",
    },
    {
      key: "moldsUsed",
      labelEn: "Molds / rounds completed",
      labelUr: "مولڈ / راؤنڈ مکمل",
      type: "number",
    },
  ],
  KILN_OPERATOR: [
    {
      key: "kilnCycles",
      labelEn: "Kiln cycles monitored",
      labelUr: "بھٹی سائیکل",
      type: "number",
    },
    {
      key: "avgTemperature",
      labelEn: "Avg temperature (°C)",
      labelUr: "اوسط درجہ حرارت",
      type: "number",
    },
    {
      key: "fuelUsed",
      labelEn: "Fuel used (tons/liters)",
      labelUr: "ایندھن استعمال",
      type: "number",
    },
  ],
  LOADER: [
    {
      key: "bricksLoaded",
      labelEn: "Bricks loaded",
      labelUr: "لوڈ کی گئی اینٹیں",
      type: "number",
    },
    {
      key: "truckLoads",
      labelEn: "Truck loads",
      labelUr: "ٹرک لوڈ",
      type: "number",
    },
  ],
  UNLOADER: [
    {
      key: "bricksUnloaded",
      labelEn: "Bricks unloaded",
      labelUr: "اتاری گئی اینٹیں",
      type: "number",
    },
  ],
  QUALITY_CHECK: [
    {
      key: "bricksChecked",
      labelEn: "Bricks checked",
      labelUr: "چیک کی گئی اینٹیں",
      type: "number",
    },
    {
      key: "brokenSorted",
      labelEn: "Broken / wastage sorted",
      labelUr: "ٹوٹی اینٹیں",
      type: "number",
    },
  ],
  MAINTENANCE: [
    {
      key: "jobsDone",
      labelEn: "Repair jobs completed",
      labelUr: "مرمت کے کام",
      type: "number",
    },
    {
      key: "equipmentFixed",
      labelEn: "Equipment fixed (describe)",
      labelUr: "مرمت شدہ مشین",
      type: "text",
    },
  ],
  DISPATCH: [
    {
      key: "trucksDispatched",
      labelEn: "Trucks dispatched",
      labelUr: "بھیجی گئی گاڑیاں",
      type: "number",
    },
    {
      key: "challansPrepared",
      labelEn: "Challans prepared",
      labelUr: "چالان تیار",
      type: "number",
    },
  ],
  SECURITY: [
    {
      key: "visitorsLogged",
      labelEn: "Visitors logged",
      labelUr: "وزیٹر ریکارڈ",
      type: "number",
    },
  ],
  OFFICE: [
    {
      key: "entriesMade",
      labelEn: "Register entries",
      labelUr: "انٹریز",
      type: "number",
    },
  ],
  OTHER: [
    {
      key: "workUnits",
      labelEn: "Work units completed",
      labelUr: "کام کی اکائیاں",
      type: "number",
    },
    {
      key: "workDescription",
      labelEn: "Work done (short)",
      labelUr: "کام کی تفصیل",
      type: "text",
    },
  ],
};

export const WORK_REPORT_FIELDS_BY_CATEGORY: Record<WorkerCategoryCode, WorkReportField[]> = {
  BRICK_MOLDING: WORK_REPORT_FIELDS.MOLDING,
  CLAY_MITTI: [
    {
      key: "mittiPits",
      labelEn: "Clay pits prepared",
      labelUr: "مٹی کے گڑھے",
      type: "number",
    },
    {
      key: "cartsPrepared",
      labelEn: "Carts of mitti supplied",
      labelUr: "مٹی کی ٹرالیاں",
      type: "number",
    },
  ],
  KILN_FIREMAN: WORK_REPORT_FIELDS.KILN_OPERATOR,
  WOOD_FUEL: [
    {
      key: "woodTons",
      labelEn: "Firewood fed (tons)",
      labelUr: "لکڑی (ٹن)",
      type: "number",
    },
    {
      key: "woodWasteTons",
      labelEn: "Wood waste fed (tons)",
      labelUr: "لکڑی کچرا (ٹن)",
      type: "number",
    },
    {
      key: "kilnLoads",
      labelEn: "Kiln feeding rounds",
      labelUr: "بھٹی راؤنڈ",
      type: "number",
    },
  ],
  BRICK_LOADER: WORK_REPORT_FIELDS.LOADER,
  TRACTOR_DRIVER: [
    {
      key: "trips",
      labelEn: "Trips completed",
      labelUr: "سفر",
      type: "number",
    },
    {
      key: "fuelLiters",
      labelEn: "Fuel used (liters)",
      labelUr: "ایندھن (لیٹر)",
      type: "number",
    },
  ],
  TRUCK_DRIVER: [
    {
      key: "deliveries",
      labelEn: "Deliveries completed",
      labelUr: "ڈیلیوری",
      type: "number",
    },
    {
      key: "challans",
      labelEn: "Challans signed",
      labelUr: "چالان",
      type: "number",
    },
  ],
  FUEL_COAL: [
    {
      key: "coalTons",
      labelEn: "Coal fed (tons)",
      labelUr: "کوئلہ (ٹن)",
      type: "number",
    },
  ],
  WATER_PUMP: [
    {
      key: "pumpHours",
      labelEn: "Pump running hours",
      labelUr: "پمپ گھنٹے",
      type: "number",
    },
  ],
  GENERAL_HELPER: WORK_REPORT_FIELDS.OTHER,
  SUPERVISOR: [
    {
      key: "teamsChecked",
      labelEn: "Teams monitored",
      labelUr: "ٹیم چیک",
      type: "number",
    },
    {
      key: "issuesResolved",
      labelEn: "Issues resolved",
      labelUr: "مسائل حل",
      type: "number",
    },
  ],
  MECHANIC: WORK_REPORT_FIELDS.MAINTENANCE,
  SECURITY_GUARD: WORK_REPORT_FIELDS.SECURITY,
  ELECTRICIAN: WORK_REPORT_FIELDS.MAINTENANCE,
  DISPATCH_WORKER: WORK_REPORT_FIELDS.DISPATCH,
  CLEANING_STAFF: [
    {
      key: "areasCleaned",
      labelEn: "Areas cleaned",
      labelUr: "صفائی شدہ جگہیں",
      type: "number",
    },
  ],
};

export function workReportFieldsForCategory(code: string): WorkReportField[] {
  const resolved = resolveCategoryCode(code);
  if (resolved && WORK_REPORT_FIELDS_BY_CATEGORY[resolved]) {
    return WORK_REPORT_FIELDS_BY_CATEGORY[resolved];
  }
  return workReportFieldsForRole(code);
}

export function workReportFieldsForRole(role: string): WorkReportField[] {
  const cat = resolveCategoryCode(role);
  if (cat) return WORK_REPORT_FIELDS_BY_CATEGORY[cat];
  const key = role as WorkerJobRole;
  return WORK_REPORT_FIELDS[key] ?? WORK_REPORT_FIELDS.OTHER;
}

export type WorkReportData = Record<string, string | number | undefined>;

export function parseWorkReport(raw: unknown): WorkReportData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as WorkReportData;
}

export function summarizeWorkReport(roleOrCategory: string, data: WorkReportData, locale: "en" | "ur") {
  const fields = workReportFieldsForCategory(roleOrCategory);
  const parts: string[] = [];
  for (const f of fields) {
    const v = data[f.key];
    if (v !== undefined && v !== "" && v !== null) {
      parts.push(`${locale === "ur" ? f.labelUr : f.labelEn}: ${v}`);
    }
  }
  return parts.join(" · ") || (locale === "ur" ? "کوئی تفصیل نہیں" : "No work details");
}

export function primaryQuantityFromReport(
  roleOrCategory: string,
  data: WorkReportData
): number | null {
  const keys: Record<string, string> = {
    MOLDING: "bricksMolded",
    BRICK_MOLDING: "bricksMolded",
    LOADER: "bricksLoaded",
    BRICK_LOADER: "bricksLoaded",
    UNLOADER: "bricksUnloaded",
    QUALITY_CHECK: "bricksChecked",
    TRACTOR_DRIVER: "trips",
    TRUCK_DRIVER: "deliveries",
  };
  const cat = resolveCategoryCode(roleOrCategory);
  const k = keys[cat ?? roleOrCategory];
  if (!k) return null;
  const v = data[k];
  return typeof v === "number" ? v : v ? Number(v) : null;
}

export function attendanceModeForWorker(worker: {
  category?: { code: string; attendanceMode: string } | null;
  jobRole?: string;
}): string {
  if (worker.category?.attendanceMode) return worker.category.attendanceMode;
  const cat = worker.jobRole ? legacyRoleToCategory(worker.jobRole as WorkerJobRole) : null;
  if (cat) return categoryByCode(cat)?.attendanceMode ?? "STANDARD";
  return "STANDARD";
}

export function hoursFromCheckTimes(
  checkIn: Date,
  checkOut: Date,
  standardHours: number
): { regularHours: number; extraHours: number } {
  const ms = Math.max(0, checkOut.getTime() - checkIn.getTime());
  const total = ms / (1000 * 60 * 60);
  const regular = Math.min(total, standardHours);
  const extra = Math.max(0, total - standardHours);
  return {
    regularHours: Math.round(regular * 100) / 100,
    extraHours: Math.round(extra * 100) / 100,
  };
}
