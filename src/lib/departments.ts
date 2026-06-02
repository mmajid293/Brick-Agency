import type { LucideIcon } from "lucide-react";
import {
  Factory,
  Flame,
  Truck,
  Wrench,
  Shield,
  Wallet,
  Building2,
  Droplets,
} from "lucide-react";

export type DepartmentCode =
  | "PRODUCTION"
  | "KILN_OPERATIONS"
  | "DISPATCH"
  | "TRANSPORT"
  | "MAINTENANCE"
  | "SECURITY"
  | "FINANCE"
  | "ADMINISTRATION"
  | "UTILITIES";

export type DepartmentDef = {
  code: DepartmentCode;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  icon: LucideIcon;
  sortOrder: number;
};

export const DEPARTMENTS: DepartmentDef[] = [
  {
    code: "PRODUCTION",
    nameEn: "Production",
    nameUr: "پیداوار",
    descriptionEn: "Molding, clay prep, yard labor",
    descriptionUr: "اینٹ بنانا، مٹی، عام مزدوری",
    icon: Factory,
    sortOrder: 1,
  },
  {
    code: "KILN_OPERATIONS",
    nameEn: "Kiln Operations",
    nameUr: "بھٹی آپریشن",
    descriptionEn: "Firing, fuel, kiln monitoring",
    descriptionUr: "بھٹی، ایندھن، درجہ حرارت",
    icon: Flame,
    sortOrder: 2,
  },
  {
    code: "DISPATCH",
    nameEn: "Dispatch",
    nameUr: "ڈسپیچ",
    descriptionEn: "Loading orders, challan, yard dispatch",
    descriptionUr: "آرڈر لوڈ، چالان",
    icon: Truck,
    sortOrder: 3,
  },
  {
    code: "TRANSPORT",
    nameEn: "Transport",
    nameUr: "ٹرانسپورٹ",
    descriptionEn: "Tractor & truck drivers",
    descriptionUr: "ٹریکٹر اور ٹرک ڈرائیور",
    icon: Truck,
    sortOrder: 4,
  },
  {
    code: "MAINTENANCE",
    nameEn: "Maintenance",
    nameUr: "مرمت",
    descriptionEn: "Mechanics, electricians, equipment",
    descriptionUr: "مکینک، الیکٹریشن",
    icon: Wrench,
    sortOrder: 5,
  },
  {
    code: "SECURITY",
    nameEn: "Security",
    nameUr: "سیکیورٹی",
    descriptionEn: "Gate and site security",
    descriptionUr: "گیٹ اور بھٹہ سیکیورٹی",
    icon: Shield,
    sortOrder: 6,
  },
  {
    code: "FINANCE",
    nameEn: "Finance",
    nameUr: "مالیات",
    descriptionEn: "Accounts, payroll support",
    descriptionUr: "اکاؤنٹس، تنخواہ",
    icon: Wallet,
    sortOrder: 7,
  },
  {
    code: "ADMINISTRATION",
    nameEn: "Administration",
    nameUr: "انتظامیہ",
    descriptionEn: "Supervisors, office, cleaning",
    descriptionUr: "سپروائزر، دفتر، صفائی",
    icon: Building2,
    sortOrder: 8,
  },
  {
    code: "UTILITIES",
    nameEn: "Utilities",
    nameUr: "یوٹیلیٹی",
    descriptionEn: "Water pump, site services",
    descriptionUr: "پانی کا پمپ، سہولیات",
    icon: Droplets,
    sortOrder: 9,
  },
];

export function departmentLabel(code: string, locale: "en" | "ur" = "en") {
  const row = DEPARTMENTS.find((d) => d.code === code);
  if (!row) return code;
  return locale === "ur" ? row.nameUr : row.nameEn;
}

export function isValidDepartmentCode(code: string): code is DepartmentCode {
  return DEPARTMENTS.some((d) => d.code === code);
}
