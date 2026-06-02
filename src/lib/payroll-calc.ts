import type { AttendanceStatus, WageType } from "@prisma/client";
import { endOfMonth, startOfMonth } from "date-fns";

/** Standard payable days per month (bhatta practice ~26 working days). */
export const PAYROLL_WORKING_DAYS = 26;

const OT_MULTIPLIER = 1.5;

export type AttendanceRow = {
  status: AttendanceStatus;
  regularHours: number | string | { toString(): string };
  extraHours: number | string | { toString(): string };
  overtime: number | string | { toString(): string };
  bricksProduced: number | null;
  workReport: Record<string, unknown> | null;
};

export type WorkerPayInput = {
  id: string;
  name: string;
  wageType: WageType;
  dailyWage: number;
  perBrickRate: number;
  monthlySalary: number;
  perTruckRate: number;
  standardHoursPerDay: number;
  bricksTargetPerDay: number | null;
  advanceBalance: number;
};

export type PayrollLineItem = {
  key: string;
  labelEn: string;
  labelUr: string;
  amount: number;
};

export type PayrollCalculation = {
  workerId: string;
  workerName: string;
  wageType: WageType;
  month: number;
  year: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  totalBricks: number;
  totalTruckTrips: number;
  baseSalary: number;
  brickBonus: number;
  overtimePay: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  items: PayrollLineItem[];
  skipped?: boolean;
  skipReason?: string;
};

export function monthDateRange(month: number, year: number) {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return { start, end };
}

export function payableDayUnits(status: AttendanceStatus): number {
  switch (status) {
    case "PRESENT":
    case "OVERTIME":
      return 1;
    case "HALF_DAY":
      return 0.5;
    default:
      return 0;
  }
}

function num(v: number | string | null | undefined | { toString(): string }): number {
  if (v == null) return 0;
  if (typeof v === "object" && "toString" in v) return Number(v.toString());
  return Number(v);
}

function bricksFromWorkReport(report: Record<string, unknown> | null): number {
  if (!report || typeof report !== "object") return 0;
  const keys = ["bricksMolded", "bricksProduced", "bricksLoaded", "bricksUnloaded", "bricksChecked"];
  for (const k of keys) {
    const v = report[k];
    if (typeof v === "number" && v > 0) return v;
    if (typeof v === "string" && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}

function truckTripsFromWorkReport(report: Record<string, unknown> | null): number {
  if (!report || typeof report !== "object") return 0;
  const v = report.truckLoads ?? report.tripCount ?? report.trips;
  return num(v as number);
}

export function sumAttendanceBricks(attendances: AttendanceRow[]): number {
  let total = 0;
  for (const a of attendances) {
    if (payableDayUnits(a.status) <= 0) continue;
    const b = a.bricksProduced ?? bricksFromWorkReport(a.workReport);
    total += b;
  }
  return total;
}

export function sumOvertimePay(
  attendances: AttendanceRow[],
  dailyWage: number,
  standardHours: number
): number {
  const hourly = standardHours > 0 ? dailyWage / standardHours : dailyWage / 8;
  let total = 0;
  for (const a of attendances) {
    const extra = num(a.extraHours) || num(a.overtime);
    if (extra > 0) {
      total += extra * hourly * OT_MULTIPLIER;
    } else if (a.status === "OVERTIME") {
      total += 2 * hourly * OT_MULTIPLIER;
    }
  }
  return Math.round(total);
}

export function calcBrickTargetBonus(
  totalBricks: number,
  targetPerDay: number | null,
  payableDays: number,
  perBrickRate: number
): number {
  if (!targetPerDay || payableDays <= 0 || totalBricks <= 0) return 0;
  const target = targetPerDay * payableDays;
  if (totalBricks <= target) return 0;
  const excess = totalBricks - target;
  return Math.round(excess * perBrickRate * 0.15);
}

export type CalcOptions = {
  deductAdvance?: boolean;
  maxAdvanceDeductionPct?: number;
};

export function calculateWorkerPayroll(
  worker: WorkerPayInput,
  attendances: AttendanceRow[],
  productionBricks: number,
  dispatchTrips: number,
  month: number,
  year: number,
  options: CalcOptions = {}
): PayrollCalculation {
  const { deductAdvance = true, maxAdvanceDeductionPct = 0.35 } = options;

  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let payableDays = 0;

  for (const a of attendances) {
    const units = payableDayUnits(a.status);
    payableDays += units;
    if (a.status === "PRESENT" || a.status === "OVERTIME") presentDays++;
    else if (a.status === "HALF_DAY") halfDays++;
    else if (a.status === "LEAVE") leaveDays++;
    else if (a.status === "ABSENT") absentDays++;
  }

  const attendanceBricks = sumAttendanceBricks(attendances);
  const workReportBricks = attendances.reduce(
    (s, a) => s + (payableDayUnits(a.status) > 0 ? bricksFromWorkReport(a.workReport) : 0),
    0
  );
  const totalBricks = Math.max(attendanceBricks, productionBricks, workReportBricks);

  let tripCount = dispatchTrips;
  if (tripCount === 0) {
    tripCount = attendances.reduce(
      (s, a) => s + (payableDayUnits(a.status) > 0 ? truckTripsFromWorkReport(a.workReport) : 0),
      0
    );
  }

  const items: PayrollLineItem[] = [];
  let baseSalary = 0;
  let brickBonus = 0;
  let overtimePay = 0;

  const stdHours = worker.standardHoursPerDay > 0 ? worker.standardHoursPerDay : 8;

  switch (worker.wageType) {
    case "MONTHLY": {
      const factor = Math.min(1, payableDays / PAYROLL_WORKING_DAYS);
      baseSalary = Math.round(worker.monthlySalary * factor);
      items.push({
        key: "monthly",
        labelEn: `Monthly salary (${payableDays}/${PAYROLL_WORKING_DAYS} days)`,
        labelUr: `ماہانہ تنخواہ (${payableDays}/${PAYROLL_WORKING_DAYS} دن)`,
        amount: baseSalary,
      });
      overtimePay = sumOvertimePay(attendances, worker.dailyWage || worker.monthlySalary / 26, stdHours);
      break;
    }
    case "PER_THOUSAND_BRICKS": {
      baseSalary = Math.round(totalBricks * worker.perBrickRate);
      items.push({
        key: "piece_bricks",
        labelEn: `Piece rate: ${totalBricks.toLocaleString()} bricks × ${worker.perBrickRate}`,
        labelUr: `پیس ریٹ: ${totalBricks.toLocaleString()} اینٹ × ${worker.perBrickRate}`,
        amount: baseSalary,
      });
      brickBonus = calcBrickTargetBonus(
        totalBricks,
        worker.bricksTargetPerDay,
        payableDays,
        worker.perBrickRate
      );
      if (brickBonus > 0) {
        items.push({
          key: "target_bonus",
          labelEn: "Target exceeded bonus",
          labelUr: "ہدف سے زیادہ بونس",
          amount: brickBonus,
        });
      }
      break;
    }
    case "PER_TRUCK": {
      baseSalary = Math.round(tripCount * worker.perTruckRate);
      items.push({
        key: "per_truck",
        labelEn: `Per truck: ${tripCount} trips × ${worker.perTruckRate}`,
        labelUr: `فی ٹرک: ${tripCount} سفر × ${worker.perTruckRate}`,
        amount: baseSalary,
      });
      break;
    }
    case "SHIFT":
    case "DAILY":
    default: {
      baseSalary = Math.round(payableDays * worker.dailyWage);
      items.push({
        key: "daily",
        labelEn: `Daily wage: ${payableDays} days × ${worker.dailyWage}`,
        labelUr: `روزانہ اجرت: ${payableDays} دن × ${worker.dailyWage}`,
        amount: baseSalary,
      });
      if (totalBricks > 0 && worker.perBrickRate > 0) {
        const pieceExtra = Math.round(totalBricks * worker.perBrickRate * 0.25);
        brickBonus = pieceExtra;
        items.push({
          key: "brick_extra",
          labelEn: `Production top-up (${totalBricks} bricks)`,
          labelUr: `پیداوار اضافہ (${totalBricks} اینٹ)`,
          amount: pieceExtra,
        });
      }
      overtimePay = sumOvertimePay(attendances, worker.dailyWage, stdHours);
      break;
    }
  }

  if (overtimePay > 0) {
    items.push({
      key: "overtime",
      labelEn: "Overtime / extra hours",
      labelUr: "اوور ٹائم / اضافی گھنٹے",
      amount: overtimePay,
    });
  }

  const grossPay = baseSalary + brickBonus + overtimePay;
  let deductions = 0;

  if (deductAdvance && worker.advanceBalance > 0 && grossPay > 0) {
    const cap = Math.round(grossPay * maxAdvanceDeductionPct);
    deductions = Math.min(worker.advanceBalance, cap);
    if (deductions > 0) {
      items.push({
        key: "advance",
        labelEn: "Advance (peshgi) deduction",
        labelUr: "پیشگی کٹوتی",
        amount: -deductions,
      });
    }
  }

  const netPay = Math.max(0, grossPay - deductions);

  return {
    workerId: worker.id,
    workerName: worker.name,
    wageType: worker.wageType,
    month,
    year,
    presentDays,
    halfDays,
    absentDays,
    leaveDays,
    totalBricks,
    totalTruckTrips: tripCount,
    baseSalary,
    brickBonus,
    overtimePay,
    deductions,
    grossPay,
    netPay,
    items,
    skipped: payableDays === 0 && worker.wageType !== "MONTHLY" && totalBricks === 0 && tripCount === 0,
    skipReason:
      payableDays === 0 && worker.wageType !== "MONTHLY"
        ? "No payable attendance or production in this month"
        : undefined,
  };
}
