export type AttendanceStatusValue =
  | "PRESENT"
  | "ABSENT"
  | "LEAVE"
  | "HALF_DAY"
  | "OVERTIME";

export const ATTENDANCE_STATUSES: {
  value: AttendanceStatusValue;
  labelEn: string;
  labelUr: string;
  btnClass: string;
  activeClass: string;
}[] = [
  {
    value: "PRESENT",
    labelEn: "Present",
    labelUr: "حاضر",
    btnClass: "border-green-600/40 bg-green-500/10 text-green-800 hover:bg-green-500/25",
    activeClass: "ring-2 ring-green-600 bg-green-500/30 font-bold",
  },
  {
    value: "ABSENT",
    labelEn: "Absent",
    labelUr: "غیر حاضر",
    btnClass: "border-red-600/40 bg-red-500/10 text-red-800 hover:bg-red-500/25",
    activeClass: "ring-2 ring-red-600 bg-red-500/30 font-bold",
  },
  {
    value: "LEAVE",
    labelEn: "Leave",
    labelUr: "چھٹی",
    btnClass: "border-blue-600/40 bg-blue-500/10 text-blue-800 hover:bg-blue-500/25",
    activeClass: "ring-2 ring-blue-600 bg-blue-500/30 font-bold",
  },
  {
    value: "HALF_DAY",
    labelEn: "Half Day",
    labelUr: "آدھا دن",
    btnClass: "border-amber-600/40 bg-amber-500/10 text-amber-900 hover:bg-amber-500/25",
    activeClass: "ring-2 ring-amber-600 bg-amber-500/30 font-bold",
  },
  {
    value: "OVERTIME",
    labelEn: "Overtime",
    labelUr: "اوور ٹائم",
    btnClass: "border-purple-600/40 bg-purple-500/10 text-purple-800 hover:bg-purple-500/25",
    activeClass: "ring-2 ring-purple-600 bg-purple-500/30 font-bold",
  },
];

export function attendanceStatusLabel(status: string, locale: "en" | "ur") {
  const row = ATTENDANCE_STATUSES.find((s) => s.value === status);
  if (!row) return status;
  return locale === "ur" ? row.labelUr : row.labelEn;
}
