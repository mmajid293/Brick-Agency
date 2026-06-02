import type {
  AttendanceMode,
  ShiftType,
  WageType,
  WorkerJobRole,
} from "@prisma/client";
import type { DepartmentCode } from "./departments";

export type WorkerCategoryCode =
  | "BRICK_MOLDING"
  | "CLAY_MITTI"
  | "KILN_FIREMAN"
  | "WOOD_FUEL"
  | "BRICK_LOADER"
  | "TRACTOR_DRIVER"
  | "TRUCK_DRIVER"
  | "FUEL_COAL"
  | "WATER_PUMP"
  | "GENERAL_HELPER"
  | "SUPERVISOR"
  | "MECHANIC"
  | "SECURITY_GUARD"
  | "ELECTRICIAN"
  | "DISPATCH_WORKER"
  | "CLEANING_STAFF";

export type WorkerCategoryDef = {
  code: WorkerCategoryCode;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  departmentCode: DepartmentCode;
  wageType: WageType;
  attendanceMode: AttendanceMode;
  legacyJobRole: WorkerJobRole;
  defaultDailyWage: number;
  defaultPerBrick: number;
  defaultPerTruck: number;
  defaultMonthly: number;
  defaultShift?: ShiftType;
  defaultTarget?: number;
  iconKey: string;
  colorKey: string;
  workHintEn: string;
  workHintUr: string;
  sortOrder: number;
};

export const WORKER_CATEGORIES: WorkerCategoryDef[] = [
  {
    code: "BRICK_MOLDING",
    nameEn: "Brick Molding Workers",
    nameUr: "اینٹ بنانے والے",
    descriptionEn: "Hand/machine molding — paid per 1000 bricks",
    descriptionUr: "ہاتھ/مشین سے اینٹ — ہزار اینٹ پر اجرت",
    departmentCode: "PRODUCTION",
    wageType: "PER_THOUSAND_BRICKS",
    attendanceMode: "PRODUCTION",
    legacyJobRole: "MOLDING",
    defaultDailyWage: 1800,
    defaultPerBrick: 0.18,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    defaultTarget: 900,
    iconKey: "boxes",
    colorKey: "amber",
    workHintEn: "Bricks molded, molds per day",
    workHintUr: "اینٹ بنانا، مولڈ",
    sortOrder: 1,
  },
  {
    code: "CLAY_MITTI",
    nameEn: "Clay / Mitti Workers",
    nameUr: "مٹی / کلے کے مزدور",
    descriptionEn: "Clay mixing, soil prep for molding",
    descriptionUr: "مٹی ملانا، کلے کی تیاری",
    departmentCode: "PRODUCTION",
    wageType: "DAILY",
    attendanceMode: "PRODUCTION",
    legacyJobRole: "OTHER",
    defaultDailyWage: 1600,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "layers",
    colorKey: "stone",
    workHintEn: "Clay pits prepared, carts of mitti",
    workHintUr: "مٹی تیار، ٹرالی",
    sortOrder: 2,
  },
  {
    code: "KILN_FIREMAN",
    nameEn: "Kiln Firemen",
    nameUr: "بھٹی آگ والے",
    descriptionEn: "Shift-based kiln firing & temperature",
    descriptionUr: "بھٹی میں آگ، شفٹ پر کام",
    departmentCode: "KILN_OPERATIONS",
    wageType: "SHIFT",
    attendanceMode: "SHIFT",
    legacyJobRole: "KILN_OPERATOR",
    defaultDailyWage: 2200,
    defaultPerBrick: 0.05,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "NIGHT",
    iconKey: "flame",
    colorKey: "red",
    workHintEn: "Kiln cycles, temperature, wood/coal feed",
    workHintUr: "بھٹی سائیکل، لکڑی/کوئلہ",
    sortOrder: 3,
  },
  {
    code: "WOOD_FUEL",
    nameEn: "Wood & Wood Waste Workers",
    nameUr: "لکڑی / لکڑی کچرا مزدور",
    descriptionEn: "Firewood & wood waste feeding — main bhatha kiln fuel",
    descriptionUr: "لکڑی اور کچرا بھٹی میں — زیادہ تر بھٹوں کا ایندھن",
    departmentCode: "KILN_OPERATIONS",
    wageType: "DAILY",
    attendanceMode: "PRODUCTION",
    legacyJobRole: "OTHER",
    defaultDailyWage: 1800,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "wood",
    colorKey: "lime",
    workHintEn: "Wood tons, wood waste carts fed to kiln",
    workHintUr: "لکڑی ٹن، کچرا بھٹی میں",
    sortOrder: 4,
  },
  {
    code: "BRICK_LOADER",
    nameEn: "Brick Loaders",
    nameUr: "اینٹ لوڈ کرنے والے",
    descriptionEn: "Per truck load payment",
    descriptionUr: "ٹرک لوڈ پر اجرت",
    departmentCode: "DISPATCH",
    wageType: "PER_TRUCK",
    attendanceMode: "PRODUCTION",
    legacyJobRole: "LOADER",
    defaultDailyWage: 1700,
    defaultPerBrick: 0.08,
    defaultPerTruck: 450,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "package",
    colorKey: "blue",
    workHintEn: "Truck loads, bricks loaded",
    workHintUr: "ٹرک لوڈ، اینٹ لوڈ",
    sortOrder: 5,
  },
  {
    code: "TRACTOR_DRIVER",
    nameEn: "Tractor Drivers",
    nameUr: "ٹریکٹر ڈرائیور",
    descriptionEn: "Monthly salary + fuel tracking",
    descriptionUr: "ماہانہ تنخواہ، ایندھن",
    departmentCode: "TRANSPORT",
    wageType: "MONTHLY",
    attendanceMode: "TRIP",
    legacyJobRole: "OTHER",
    defaultDailyWage: 0,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 35000,
    defaultShift: "MORNING",
    iconKey: "tractor",
    colorKey: "green",
    workHintEn: "Trips, fuel liters, yard moves",
    workHintUr: "سفر، ایندھن، ٹرالی",
    sortOrder: 6,
  },
  {
    code: "TRUCK_DRIVER",
    nameEn: "Truck Drivers",
    nameUr: "ٹرک ڈرائیور",
    descriptionEn: "Delivery trips to customers",
    descriptionUr: "کسٹمر ڈیلیوری",
    departmentCode: "TRANSPORT",
    wageType: "MONTHLY",
    attendanceMode: "TRIP",
    legacyJobRole: "DISPATCH",
    defaultDailyWage: 0,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 42000,
    defaultShift: "MORNING",
    iconKey: "truck",
    colorKey: "indigo",
    workHintEn: "Deliveries, challan trips",
    workHintUr: "ڈیلیوری، چالان",
    sortOrder: 7,
  },
  {
    code: "FUEL_COAL",
    nameEn: "Coal Workers",
    nameUr: "کوئلہ مزدور",
    descriptionEn: "Coal supply where bhatha uses coal",
    descriptionUr: "کوئلہ بھٹی میں (جہاں استعمال ہو)",
    departmentCode: "KILN_OPERATIONS",
    wageType: "DAILY",
    attendanceMode: "PRODUCTION",
    legacyJobRole: "OTHER",
    defaultDailyWage: 1750,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "fuel",
    colorKey: "orange",
    workHintEn: "Coal tons fed, fuel stock",
    workHintUr: "کوئلہ ٹن، ایندھن",
    sortOrder: 8,
  },
  {
    code: "WATER_PUMP",
    nameEn: "Water Pump Operators",
    nameUr: "پانی کے پمپ آپریٹر",
    descriptionEn: "Site water supply for molding/kiln",
    descriptionUr: "بھٹہ میں پانی کی سپلائی",
    departmentCode: "UTILITIES",
    wageType: "DAILY",
    attendanceMode: "STANDARD",
    legacyJobRole: "OTHER",
    defaultDailyWage: 1650,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "droplets",
    colorKey: "cyan",
    workHintEn: "Pump hours, water tanks filled",
    workHintUr: "پمپ گھنٹے، ٹینک",
    sortOrder: 9,
  },
  {
    code: "GENERAL_HELPER",
    nameEn: "General Labor Helpers",
    nameUr: "عام مددگار مزدور",
    descriptionEn: "Daily wage yard support",
    descriptionUr: "روزانہ اجرت، عام کام",
    departmentCode: "PRODUCTION",
    wageType: "DAILY",
    attendanceMode: "STANDARD",
    legacyJobRole: "OTHER",
    defaultDailyWage: 1500,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "users",
    colorKey: "slate",
    workHintEn: "Tasks completed on site",
    workHintUr: "بھٹہ پر کام",
    sortOrder: 10,
  },
  {
    code: "SUPERVISOR",
    nameEn: "Supervisors",
    nameUr: "سپروائزر",
    descriptionEn: "Monthly — team monitoring",
    descriptionUr: "ماہانہ — ٹیم نگرانی",
    departmentCode: "ADMINISTRATION",
    wageType: "MONTHLY",
    attendanceMode: "TEAM_MONITOR",
    legacyJobRole: "OFFICE",
    defaultDailyWage: 0,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 55000,
    defaultShift: "MORNING",
    iconKey: "clipboard",
    colorKey: "violet",
    workHintEn: "Teams present, issues resolved",
    workHintUr: "ٹیم حاضری، مسائل",
    sortOrder: 11,
  },
  {
    code: "MECHANIC",
    nameEn: "Mechanics",
    nameUr: "مکینک",
    descriptionEn: "Equipment & kiln repairs",
    descriptionUr: "مشین اور بھٹی مرمت",
    departmentCode: "MAINTENANCE",
    wageType: "DAILY",
    attendanceMode: "STANDARD",
    legacyJobRole: "MAINTENANCE",
    defaultDailyWage: 2000,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "wrench",
    colorKey: "zinc",
    workHintEn: "Repair jobs, parts replaced",
    workHintUr: "مرمت، پرزے",
    sortOrder: 12,
  },
  {
    code: "SECURITY_GUARD",
    nameEn: "Security Guards",
    nameUr: "سیکیورٹی گارڈ",
    descriptionEn: "Gate security — monthly/shift",
    descriptionUr: "گیٹ سیکیورٹی",
    departmentCode: "SECURITY",
    wageType: "MONTHLY",
    attendanceMode: "STANDARD",
    legacyJobRole: "SECURITY",
    defaultDailyWage: 0,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 28000,
    defaultShift: "NIGHT",
    iconKey: "shield",
    colorKey: "emerald",
    workHintEn: "Gate rounds, visitors logged",
    workHintUr: "گیٹ، آنے والے",
    sortOrder: 13,
  },
  {
    code: "ELECTRICIAN",
    nameEn: "Electricians",
    nameUr: "الیکٹریشن",
    descriptionEn: "Electrical maintenance on site",
    descriptionUr: "بجلی کی مرمت",
    departmentCode: "MAINTENANCE",
    wageType: "DAILY",
    attendanceMode: "STANDARD",
    legacyJobRole: "MAINTENANCE",
    defaultDailyWage: 2100,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "zap",
    colorKey: "yellow",
    workHintEn: "Wiring jobs, motor repairs",
    workHintUr: "تار، موٹر",
    sortOrder: 14,
  },
  {
    code: "DISPATCH_WORKER",
    nameEn: "Dispatch Workers",
    nameUr: "ڈسپیچ مزدور",
    descriptionEn: "Order loading & challan prep",
    descriptionUr: "آرڈر لوڈ، چالان",
    departmentCode: "DISPATCH",
    wageType: "DAILY",
    attendanceMode: "PRODUCTION",
    legacyJobRole: "DISPATCH",
    defaultDailyWage: 1750,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "send",
    colorKey: "teal",
    workHintEn: "Orders dispatched, bricks counted",
    workHintUr: "ڈسپیچ، گنتی",
    sortOrder: 15,
  },
  {
    code: "CLEANING_STAFF",
    nameEn: "Cleaning Staff",
    nameUr: "صفائی عملہ",
    descriptionEn: "Site & office cleaning",
    descriptionUr: "بھٹہ اور دفتر صفائی",
    departmentCode: "ADMINISTRATION",
    wageType: "DAILY",
    attendanceMode: "STANDARD",
    legacyJobRole: "OTHER",
    defaultDailyWage: 1400,
    defaultPerBrick: 0,
    defaultPerTruck: 0,
    defaultMonthly: 0,
    defaultShift: "MORNING",
    iconKey: "sparkles",
    colorKey: "rose",
    workHintEn: "Areas cleaned, waste removed",
    workHintUr: "صفائی، کچرا",
    sortOrder: 16,
  },
];

const LEGACY_ROLE_TO_CATEGORY: Record<WorkerJobRole, WorkerCategoryCode> = {
  MOLDING: "BRICK_MOLDING",
  KILN_OPERATOR: "KILN_FIREMAN",
  LOADER: "BRICK_LOADER",
  UNLOADER: "BRICK_LOADER",
  QUALITY_CHECK: "GENERAL_HELPER",
  MAINTENANCE: "MECHANIC",
  DISPATCH: "DISPATCH_WORKER",
  SECURITY: "SECURITY_GUARD",
  OFFICE: "SUPERVISOR",
  OTHER: "GENERAL_HELPER",
};

export function categoryByCode(code: string) {
  return WORKER_CATEGORIES.find((c) => c.code === code);
}

export function categoryLabel(code: string, locale: "en" | "ur" = "en") {
  const row = categoryByCode(code);
  if (!row) return code;
  return locale === "ur" ? row.nameUr : row.nameEn;
}

export function isValidCategoryCode(code: string): code is WorkerCategoryCode {
  return WORKER_CATEGORIES.some((c) => c.code === code);
}

export function legacyRoleToCategory(role: WorkerJobRole): WorkerCategoryCode {
  return LEGACY_ROLE_TO_CATEGORY[role] ?? "GENERAL_HELPER";
}

export function resolveCategoryCode(input: string): WorkerCategoryCode | null {
  if (isValidCategoryCode(input)) return input;
  const legacy = input as WorkerJobRole;
  if (LEGACY_ROLE_TO_CATEGORY[legacy]) return LEGACY_ROLE_TO_CATEGORY[legacy];
  return null;
}

export function wageTypeLabel(wageType: string, locale: "en" | "ur" = "en") {
  const map: Record<string, { en: string; ur: string }> = {
    DAILY: { en: "Daily wage", ur: "روزانہ اجرت" },
    MONTHLY: { en: "Monthly salary", ur: "ماہانہ تنخواہ" },
    PER_THOUSAND_BRICKS: { en: "Per 1000 bricks", ur: "فی ہزار اینٹ" },
    PER_TRUCK: { en: "Per truck load", ur: "فی ٹرک لوڈ" },
    SHIFT: { en: "Per shift", ur: "فی شفٹ" },
  };
  const row = map[wageType];
  if (!row) return wageType;
  return locale === "ur" ? row.ur : row.en;
}

export function shiftTypeLabel(shift: string, locale: "en" | "ur" = "en") {
  const map: Record<string, { en: string; ur: string }> = {
    MORNING: { en: "Morning", ur: "صبح" },
    EVENING: { en: "Evening", ur: "شام" },
    NIGHT: { en: "Night", ur: "رات" },
    ROTATING: { en: "Rotating", ur: "گردش" },
    FLEXIBLE: { en: "Flexible", ur: "لچکدار" },
  };
  const row = map[shift];
  if (!row) return shift;
  return locale === "ur" ? row.ur : row.en;
}

export function allCategories() {
  return [...WORKER_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
}
