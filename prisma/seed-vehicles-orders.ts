/** Demo trucks, orders, and dispatch history for Smart Bhatha ERP */

export const SEED_VEHICLES = [
  {
    registration: "LEA-4521",
    label: "6-Wheel Mazda — Main yard",
    driverName: "Nawaz Truck Wala",
    driverPhone: "+923001111023",
    capacityBricks: 5500,
  },
  {
    registration: "LES-8892",
    label: "10-Wheel Hino",
    driverName: "Asghar Ali",
    driverPhone: "+923331234501",
    capacityBricks: 8000,
  },
  {
    registration: "LEB-3340",
    label: "6-Wheel Suzuki Carry load",
    driverName: "Rashid Mehmood",
    driverPhone: "+923331234502",
    capacityBricks: 4500,
  },
  {
    registration: "LED-9901",
    label: "14-Wheel trailer",
    driverName: "Tariq Sheikh",
    driverPhone: "+923331234503",
    capacityBricks: 12000,
  },
  {
    registration: "LEE-2218",
    label: "6-Wheel FAW",
    driverName: "Imran Bhatti",
    driverPhone: "+923331234504",
    capacityBricks: 5000,
  },
  {
    registration: "LEF-6677",
    label: "Tractor trolley LEA-TR-1",
    driverName: "Arshad Mahmood",
    driverPhone: "+923001111022",
    capacityBricks: 3500,
  },
];

export const SEED_ORDER_SPECS = [
  { customerIdx: 0, orderNumber: "ORD-2026-001", qty: 10000, rate: 18, paid: 100000, status: "CONFIRMED" as const, payment: "PARTIAL" as const, city: "Lahore" },
  { customerIdx: 1, orderNumber: "ORD-2026-002", qty: 22000, rate: 17.5, paid: 0, status: "CONFIRMED" as const, payment: "PENDING" as const, city: "Faisalabad" },
  { customerIdx: 2, orderNumber: "ORD-2026-003", qty: 8000, rate: 18.5, paid: 148000, status: "CONFIRMED" as const, payment: "PARTIAL" as const, city: "Gujranwala" },
  { customerIdx: 3, orderNumber: "ORD-2026-004", qty: 5000, rate: 19, paid: 95000, status: "PENDING" as const, payment: "PARTIAL" as const, city: "Sheikhupura" },
  { customerIdx: 4, orderNumber: "ORD-2026-005", qty: 25000, rate: 16.5, paid: 250000, status: "CONFIRMED" as const, payment: "PARTIAL" as const, city: "Lahore" },
  { customerIdx: 5, orderNumber: "ORD-2026-006", qty: 50000, rate: 17, paid: 0, status: "PENDING" as const, payment: "PENDING" as const, city: "Sheikhupura" },
  { customerIdx: 6, orderNumber: "ORD-2026-007", qty: 12000, rate: 18, paid: 50000, status: "CONFIRMED" as const, payment: "PARTIAL" as const, city: "Muridke" },
  { customerIdx: 7, orderNumber: "ORD-2026-008", qty: 6000, rate: 18.25, paid: 60000, status: "CONFIRMED" as const, payment: "PARTIAL" as const, city: "Lahore" },
  { customerIdx: 8, orderNumber: "ORD-2026-009", qty: 15000, rate: 17.75, paid: 200000, status: "CONFIRMED" as const, payment: "PARTIAL" as const, city: "Lahore" },
];

/** Partial dispatches already done (remaining = qty - sum) */
export const SEED_DISPATCH_SPECS = [
  { orderNumber: "ORD-2026-001", challanNo: "CH-2026-0001", truck: "LEA-4521", driver: "Nawaz Truck Wala", phone: "+923001111023", bricks: 5000 },
  { orderNumber: "ORD-2026-003", challanNo: "CH-2026-0002", truck: "LES-8892", driver: "Asghar Ali", phone: "+923331234501", bricks: 4000 },
  { orderNumber: "ORD-2026-005", challanNo: "CH-2026-0003", truck: "LED-9901", driver: "Tariq Sheikh", phone: "+923331234503", bricks: 10000 },
  { orderNumber: "ORD-2026-007", challanNo: "CH-2026-0004", truck: "LEB-3340", driver: "Rashid Mehmood", phone: "+923331234502", bricks: 6000 },
];
