import type { CustomerType } from "@prisma/client";

export const CUSTOMER_TYPES: {
  value: CustomerType;
  labelEn: string;
  labelUr: string;
}[] = [
  { value: "BUILDER", labelEn: "Builder", labelUr: "بلڈر" },
  { value: "CONTRACTOR", labelEn: "Contractor", labelUr: "ٹھیکیدار" },
  { value: "RETAILER", labelEn: "Retailer", labelUr: "ریٹیلر" },
  { value: "WHOLESALER", labelEn: "Wholesaler", labelUr: "تھوک فروش" },
  { value: "GOVERNMENT", labelEn: "Government", labelUr: "سرکاری" },
  { value: "OTHER", labelEn: "Other", labelUr: "دیگر" },
];

export function customerTypeLabel(type: string, locale: "en" | "ur" = "en") {
  const row = CUSTOMER_TYPES.find((t) => t.value === type);
  if (!row) return type;
  return locale === "ur" ? row.labelUr : row.labelEn;
}
