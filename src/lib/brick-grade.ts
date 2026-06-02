import type { BrickGrade } from "@prisma/client";

export const BRICK_GRADE_LABELS: Record<BrickGrade, { en: string; ur: string }> = {
  RAW: { en: "Raw bricks", ur: "کچی اینٹیں" },
  COOKED: { en: "Cooked bricks", ur: "پکی اینٹیں" },
  GRADE_A: { en: "Grade A bricks", ur: "گریڈ اے اینٹیں" },
  GRADE_B: { en: "Grade B bricks", ur: "گریڈ بی اینٹیں" },
  BROKEN: { en: "Broken bricks", ur: "ٹوٹی اینٹیں" },
};

export function brickGradeLabel(grade: BrickGrade, locale: "en" | "ur" = "en") {
  return BRICK_GRADE_LABELS[grade][locale];
}
