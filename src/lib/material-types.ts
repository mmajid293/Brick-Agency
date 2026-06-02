import type { LucideIcon } from "lucide-react";
import {
  Mountain,
  Flame,
  TreeDeciduous,
  Recycle,
  Fuel,
  Droplets,
  Layers,
} from "lucide-react";

export type MaterialTypeCode =
  | "SOIL"
  | "COAL"
  | "WOOD"
  | "WOOD_WASTE"
  | "DIESEL"
  | "WATER"
  | "SAND";

export const MATERIAL_TYPE_CODES: MaterialTypeCode[] = [
  "SOIL",
  "COAL",
  "WOOD",
  "WOOD_WASTE",
  "DIESEL",
  "WATER",
  "SAND",
];

export type MaterialMeta = {
  code: MaterialTypeCode;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  unit: string;
  icon: LucideIcon;
  gradient: string;
  border: string;
  isKilnFuel?: boolean;
};

export const MATERIAL_META: Record<MaterialTypeCode, MaterialMeta> = {
  SOIL: {
    code: "SOIL",
    nameEn: "Soil / Mitti",
    nameUr: "مٹی",
    descriptionEn: "Clay soil for brick molding",
    descriptionUr: "اینٹ بنانے کی مٹی",
    unit: "tons",
    icon: Mountain,
    gradient: "from-amber-600/20 to-yellow-700/10",
    border: "border-amber-600/40",
  },
  COAL: {
    code: "COAL",
    nameEn: "Coal",
    nameUr: "کوئلہ",
    descriptionEn: "Coal for kiln where used",
    descriptionUr: "بھٹی کا کوئلہ",
    unit: "tons",
    icon: Flame,
    gradient: "from-gray-700/25 to-slate-800/15",
    border: "border-gray-600/40",
    isKilnFuel: true,
  },
  WOOD: {
    code: "WOOD",
    nameEn: "Wood (Firewood)",
    nameUr: "لکڑی (ایندھن)",
    descriptionEn: "Main kiln fuel — firewood stacks",
    descriptionUr: "بھٹی کی لکڑی — اہم ایندھن",
    unit: "tons",
    icon: TreeDeciduous,
    gradient: "from-emerald-600/25 to-green-800/15",
    border: "border-emerald-600/45",
    isKilnFuel: true,
  },
  WOOD_WASTE: {
    code: "WOOD_WASTE",
    nameEn: "Wood Waste / Lakri Kachra",
    nameUr: "لکڑی کا کچرا",
    descriptionEn: "Sawdust, broken wood, waste — common bhatha fuel",
    descriptionUr: "برادہ، ٹوٹی لکڑی — زیادہ تر بھٹوں میں",
    unit: "tons",
    icon: Recycle,
    gradient: "from-lime-600/20 to-emerald-700/15",
    border: "border-lime-600/40",
    isKilnFuel: true,
  },
  DIESEL: {
    code: "DIESEL",
    nameEn: "Diesel",
    nameUr: "ڈیزل",
    descriptionEn: "Tractors, generators, pumps",
    descriptionUr: "ٹریکٹر، جنریٹر",
    unit: "liters",
    icon: Fuel,
    gradient: "from-blue-600/20 to-indigo-700/15",
    border: "border-blue-600/40",
  },
  WATER: {
    code: "WATER",
    nameEn: "Water",
    nameUr: "پانی",
    descriptionEn: "Molding & site water",
    descriptionUr: "اینٹ اور بھٹہ پانی",
    unit: "liters",
    icon: Droplets,
    gradient: "from-cyan-500/25 to-sky-600/15",
    border: "border-cyan-500/40",
  },
  SAND: {
    code: "SAND",
    nameEn: "Sand",
    nameUr: "ریت",
    descriptionEn: "Mixing and yard use",
    descriptionUr: "ملاوٹ اور یارڈ",
    unit: "tons",
    icon: Layers,
    gradient: "from-stone-500/25 to-stone-600/15",
    border: "border-stone-500/40",
  },
};

export function materialLabel(code: string, locale: "en" | "ur" = "en") {
  const m = MATERIAL_META[code as MaterialTypeCode];
  if (!m) return code;
  return locale === "ur" ? m.nameUr : m.nameEn;
}

export function allMaterialTypes() {
  return MATERIAL_TYPE_CODES.map((c) => MATERIAL_META[c]);
}
