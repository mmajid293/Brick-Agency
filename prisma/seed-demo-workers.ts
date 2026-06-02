/**
 * Demo workers — at least 4 per category (16 groups ≈ 64 workers) for practice & UI testing.
 */
import type { WorkerJobRole, WageType, ShiftType, SkillLevel } from "@prisma/client";
import { WORKER_CATEGORIES, type WorkerCategoryCode } from "../src/lib/worker-categories";
import type { SeedWorker } from "./seed-data";

const FIRST_NAMES = [
  { en: "Muhammad", ur: "محمد" },
  { en: "Allah Ditta", ur: "اللہ دitta" },
  { en: "Rasheed", ur: "رشید" },
  { en: "Bashir", ur: "بشیر" },
  { en: "Tariq", ur: "طارق" },
  { en: "Nadeem", ur: "ندیم" },
  { en: "Khalid", ur: "خالد" },
  { en: "Shabbir", ur: "شبیر" },
  { en: "Zafar", ur: "ظفر" },
  { en: "Farhan", ur: "فرحان" },
  { en: "Waseem", ur: "وسیم" },
  { en: "Javed", ur: "جاوید" },
  { en: "Sajid", ur: "ساجد" },
  { en: "Amjad", ur: "امجد" },
  { en: "Hafeez", ur: "حفیظ" },
  { en: "Rizwan", ur: "رضوان" },
  { en: "Nasir", ur: "ناصر" },
  { en: "Yasir", ur: "یاسر" },
  { en: "Faisal", ur: "فیصل" },
  { en: "Ghulam", ur: "غلام" },
  { en: "Akbar", ur: "اکبر" },
  { en: "Latif", ur: "لطیف" },
  { en: "Ramzan", ur: "رمضان" },
  { en: "Anwar", ur: "انور" },
  { en: "Hussain", ur: "حسین" },
];

const LAST_NAMES = [
  "Ahmed",
  "Ali",
  "Hussain",
  "Mahmood",
  "Iqbal",
  "Khan",
  "Rasheed",
  "Akram",
  "Mehmood",
  "Abbas",
  "Haider",
  "Bukhsh",
  "Ditta",
  "Bakhsh",
];

const VILLAGES = [
  "Chak 12, Sheikhupura",
  "Bhatha Road, Muridke",
  "Narang Mandi",
  "Safdarabad",
  "Ferozewala",
  "Muridke bypass",
  "Mananwala",
  "Kala Shah Kaku",
  "Bhatha colony",
  "GT Road, Lahore",
];

function cnic(seq: number) {
  const mid = String(1200000 + seq).padStart(7, "0");
  const check = (seq % 9) + 1;
  return `35202-${mid}-${check}`;
}

function phone(seq: number) {
  return `+92300${String(111000 + seq).slice(-6)}`;
}

export function buildDemoWorkers(perCategory = 4): SeedWorker[] {
  const out: SeedWorker[] = [];
  let seq = 1;

  for (const cat of WORKER_CATEGORIES) {
    for (let i = 0; i < perCategory; i++) {
      const fn = FIRST_NAMES[(seq + i) % FIRST_NAMES.length];
      const ln = LAST_NAMES[(seq * 3 + i) % LAST_NAMES.length];
      const name = `${fn.en} ${ln}`;
      const nameUrdu = `${fn.ur} ${ln}`;
      const jobRole = (cat.legacyJobRole ?? "OTHER") as WorkerJobRole;

      const dailyWage = Number(cat.defaultDailyWage) || 1500;
      const monthly = Number(cat.defaultMonthly) || 0;
      const perBrick = Number(cat.defaultPerBrick) || 0;
      const perTruck = Number(cat.defaultPerTruck) || 0;

      const worker: SeedWorker = {
        name,
        nameUrdu,
        fatherName: LAST_NAMES[(seq + i + 2) % LAST_NAMES.length],
        cnic: cnic(seq),
        phone: phone(seq),
        address: VILLAGES[(seq + i) % VILLAGES.length],
        categoryCode: cat.code as WorkerCategoryCode,
        jobRole,
        workDescription: cat.descriptionEn,
        department: cat.departmentCode,
        dailyWage: cat.wageType === "MONTHLY" ? 0 : dailyWage + i * 50,
        perBrickRate: perBrick,
        monthlySalary: monthly > 0 ? monthly + i * 1000 : undefined,
        perTruckRate: perTruck > 0 ? perTruck + i * 25 : undefined,
        wageType: cat.wageType as WageType,
        shiftType: (cat.defaultShift ?? "MORNING") as ShiftType,
        skillLevel: (i === 0 ? "FOREMAN" : i === 1 ? "SENIOR" : "SKILLED") as SkillLevel,
        standardHoursPerDay: cat.code === "SECURITY_GUARD" ? 12 : cat.code === "KILN_FIREMAN" ? 10 : 8,
        shiftStart: cat.defaultShift === "NIGHT" ? "20:00" : "06:00",
        bricksTargetPerDay:
          cat.wageType === "PER_THOUSAND_BRICKS" ? (cat.defaultTarget ?? 850) - i * 30 : undefined,
        dailyTarget: cat.defaultTarget ? cat.defaultTarget - i * 20 : undefined,
        productionAssignment: cat.workHintEn,
        advanceBalance: seq % 5 === 0 ? 5000 + seq * 200 : 0,
      };
      out.push(worker);
      seq++;
    }
  }

  return out;
}

/** Named key staff (supervisor, main driver) — merged first in seed */
export const NAMED_DEMO_WORKERS: SeedWorker[] = [
  {
    name: "Malik Rafique",
    nameUrdu: "ملک رفیق",
    fatherName: "Muhammad",
    cnic: "35202-1000001-1",
    phone: "+923001111026",
    address: "Site office, Bhatha Sheikhupura",
    categoryCode: "SUPERVISOR",
    jobRole: "OFFICE",
    workDescription: "Production supervisor — all shifts",
    department: "Administration",
    dailyWage: 0,
    monthlySalary: 58000,
    perBrickRate: 0,
    wageType: "MONTHLY",
    shiftType: "MORNING",
    skillLevel: "FOREMAN",
    standardHoursPerDay: 9,
    shiftStart: "06:00",
    productionAssignment: "All departments",
  },
  {
    name: "Nawaz Truck Wala",
    nameUrdu: "نواز ٹرک والا",
    fatherName: "Sultan",
    cnic: "35202-1111133-3",
    phone: "+923001111023",
    address: "GT Road depot",
    categoryCode: "TRUCK_DRIVER",
    jobRole: "DISPATCH",
    workDescription: "Main delivery truck driver",
    department: "Transport",
    dailyWage: 0,
    monthlySalary: 43000,
    perBrickRate: 0,
    wageType: "MONTHLY",
    shiftType: "MORNING",
    skillLevel: "SENIOR",
    standardHoursPerDay: 10,
    shiftStart: "07:00",
  },
];

export function getAllDemoWorkers(): SeedWorker[] {
  const generated = buildDemoWorkers(4);
  const cnicSet = new Set(NAMED_DEMO_WORKERS.map((w) => w.cnic));
  const merged = [...NAMED_DEMO_WORKERS];
  for (const w of generated) {
    if (!cnicSet.has(w.cnic)) {
      merged.push(w);
      cnicSet.add(w.cnic);
    }
  }
  return merged;
}
