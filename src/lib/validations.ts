import { z } from "zod";

export const cnicSchema = z
  .string()
  .min(13, "CNIC required")
  .regex(/^\d{5}-\d{7}-\d$/, "Format: 35202-1234567-1");

export const phoneSchema = z
  .string()
  .min(10, "Phone required")
  .regex(/^(\+92|0)?3\d{9}$/, "Valid Pakistani mobile required");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const workerJobRoleEnum = z.enum([
  "MOLDING",
  "KILN_OPERATOR",
  "LOADER",
  "UNLOADER",
  "QUALITY_CHECK",
  "MAINTENANCE",
  "DISPATCH",
  "SECURITY",
  "OFFICE",
  "OTHER",
]);

const workerCategoryCodeEnum = z.enum([
  "BRICK_MOLDING",
  "CLAY_MITTI",
  "KILN_FIREMAN",
  "WOOD_FUEL",
  "BRICK_LOADER",
  "TRACTOR_DRIVER",
  "TRUCK_DRIVER",
  "FUEL_COAL",
  "WATER_PUMP",
  "GENERAL_HELPER",
  "SUPERVISOR",
  "MECHANIC",
  "SECURITY_GUARD",
  "ELECTRICIAN",
  "DISPATCH_WORKER",
  "CLEANING_STAFF",
]);

const wageTypeEnum = z.enum([
  "DAILY",
  "MONTHLY",
  "PER_THOUSAND_BRICKS",
  "PER_TRUCK",
  "SHIFT",
]);

const shiftTypeEnum = z.enum(["MORNING", "EVENING", "NIGHT", "ROTATING", "FLEXIBLE"]);

const skillLevelEnum = z.enum(["TRAINEE", "SKILLED", "SENIOR", "FOREMAN"]);

export const workerSchema = z.object({
  name: z.string().min(2, "Name required"),
  nameUrdu: z.string().optional(),
  fatherName: z.string().optional(),
  cnic: cnicSchema,
  phone: phoneSchema,
  address: z.string().min(3, "Address required"),
  dailyWage: z.number().min(0),
  perBrickRate: z.number().min(0).optional(),
  monthlySalary: z.number().min(0).optional(),
  perTruckRate: z.number().min(0).optional(),
  department: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  categoryCode: workerCategoryCodeEnum.optional(),
  jobRole: workerJobRoleEnum.optional(),
  wageType: wageTypeEnum.optional(),
  shiftType: shiftTypeEnum.optional(),
  skillLevel: skillLevelEnum.optional(),
  dailyTarget: z.number().int().min(0).optional().nullable(),
  productionAssignment: z.string().optional(),
  supervisorId: z.string().optional().nullable(),
  workDescription: z.string().optional(),
  standardHoursPerDay: z.number().min(0).max(24).default(8),
  shiftStart: z.string().optional(),
  bricksTargetPerDay: z.number().int().min(0).optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  joinDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const userCreateSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password min 6 characters"),
  name: z.string().min(2, "Name required"),
  nameUrdu: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "ACCOUNTANT", "SUPERVISOR", "WORKER"]),
  phone: phoneSchema.optional().or(z.literal("")),
  workerId: z.string().optional().nullable(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  nameUrdu: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "MANAGER", "ACCOUNTANT", "SUPERVISOR", "WORKER"]).optional(),
  phone: phoneSchema.optional().or(z.literal("")),
  workerId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(6, "New password min 6 characters"),
});

export const advanceSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  reason: z.string().optional(),
  date: z.string().optional(),
});

const customerTypeEnum = z.enum([
  "BUILDER",
  "CONTRACTOR",
  "RETAILER",
  "WHOLESALER",
  "GOVERNMENT",
  "OTHER",
]);

export const customerSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: phoneSchema,
  cnic: cnicSchema.optional().or(z.literal("")),
  companyName: z.string().optional(),
  customerType: customerTypeEnum.default("BUILDER"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  balance: z.number().optional(),
  creditLimit: z.number().min(0).optional(),
  salesAgentId: z.string().optional().nullable(),
});

export const orderSchema = z.object({
  customerId: z.string().min(1),
  brickGrade: z.enum(["RAW", "COOKED", "BROKEN", "GRADE_A", "GRADE_B"]),
  quantity: z.number().int().positive(),
  ratePerBrick: z.number().positive(),
  paidAmount: z.number().min(0).optional(),
  salesAgentId: z.string().optional().nullable(),
  status: z
    .enum(["QUOTATION", "PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).optional(),
  deliveryDate: z.string().optional(),
});

export const inventoryUpdateSchema = z.object({
  grade: z.enum(["RAW", "COOKED", "BROKEN", "GRADE_A", "GRADE_B"]),
  quantity: z.number().int(),
  type: z.enum(["STOCK_IN", "STOCK_OUT", "TRANSFER", "WASTAGE", "PRODUCTION"]),
  fromGrade: z.enum(["RAW", "COOKED", "BROKEN", "GRADE_A", "GRADE_B"]).optional(),
  toGrade: z.enum(["RAW", "COOKED", "BROKEN", "GRADE_A", "GRADE_B"]).optional(),
  notes: z.string().optional(),
});

const materialTypeEnum = z.enum([
  "SOIL",
  "COAL",
  "WOOD",
  "WOOD_WASTE",
  "DIESEL",
  "WATER",
  "SAND",
]);

export const materialUpdateSchema = z.object({
  type: materialTypeEnum,
  quantity: z.coerce.number(),
  operation: z.enum(["add", "subtract", "set"]),
  notes: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2),
  phone: phoneSchema,
  address: z.string().optional(),
  material: materialTypeEnum.optional(),
});

export const materialRecordSchema = z.object({
  type: materialTypeEnum,
  quantity: z.coerce.number().positive(),
  operation: z.enum(["add", "subtract", "usage", "set"]),
  notes: z.string().optional(),
  recordDate: z.string().optional(),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1),
  material: materialTypeEnum,
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export const productionSchema = z.object({
  date: z.string(),
  rawProduced: z.coerce.number().int().min(0).default(0),
  cookedProduced: z.coerce.number().int().min(0).default(0),
  gradeA: z.coerce.number().int().min(0).default(0),
  gradeB: z.coerce.number().int().min(0).default(0),
  broken: z.coerce.number().int().min(0).default(0),
  wastage: z.coerce.number().int().min(0).default(0),
  kilnCycle: z.coerce.number().int().min(1).default(1),
  temperature: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export const transactionSchema = z.object({
  type: z.enum([
    "INCOME",
    "EXPENSE",
    "SALARY",
    "SUPPLIER_PAYMENT",
    "CUSTOMER_PAYMENT",
    "ADVANCE",
  ]),
  amount: z.coerce.number().positive(),
  description: z.string().min(2),
  descriptionUrdu: z.string().optional(),
  category: z.string().optional(),
  reference: z.string().optional(),
  customerId: z.string().optional(),
  workerId: z.string().optional(),
  date: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(2),
  titleUrdu: z.string().optional(),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  notes: z.string().optional(),
  date: z.string().optional(),
});

export const dispatchSchema = z.object({
  orderId: z.string().min(1),
  vehicleId: z.string().optional(),
  truckNumber: z.string().min(3),
  driverName: z.string().min(2),
  driverPhone: phoneSchema.optional().or(z.literal("")),
  bricksLoaded: z.coerce.number().int().positive(),
  challanNo: z.string().min(3).optional(),
  notes: z.string().optional(),
});

export const dispatchTruckLineSchema = z.object({
  vehicleId: z.string().optional(),
  truckNumber: z.string().min(3),
  driverName: z.string().min(2),
  driverPhone: phoneSchema.optional().or(z.literal("")),
  bricksLoaded: z.coerce.number().int().positive(),
  challanNo: z.string().optional(),
  biltyNo: z.string().optional(),
  transporterName: z.string().optional(),
  freightAmount: z.coerce.number().min(0).optional(),
});

export const bulkDispatchSchema = z.object({
  orderId: z.string().min(1),
  trucks: z.array(dispatchTruckLineSchema).min(1).max(20),
  notes: z.string().optional(),
});

export const attendanceSchema = z.object({
  workerId: z.string().min(1),
  date: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LEAVE", "HALF_DAY", "OVERTIME"]),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  overtime: z.coerce.number().min(0).optional(),
  regularHours: z.coerce.number().min(0).max(24).optional(),
  extraHours: z.coerce.number().min(0).max(16).optional(),
  bricksProduced: z.coerce.number().int().min(0).optional().nullable(),
  workReport: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  taskCompleted: z.string().optional(),
  notes: z.string().optional(),
});

export const checkInSchema = z.object({
  workerId: z.string().min(1),
  date: z.string().optional(),
  checkIn: z.string().optional(),
  useManualTime: z.boolean().optional(),
});

export const checkOutSchema = z.object({
  workerId: z.string().min(1),
  date: z.string().optional(),
  checkOut: z.string().optional(),
  useManualTime: z.boolean().optional(),
  workReport: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  taskCompleted: z.string().optional(),
  notes: z.string().optional(),
});

export const kilnLogSchema = z.object({
  kilnId: z.string().optional(),
  temperature: z.coerce.number().min(0),
  fuelUsed: z.coerce.number().min(0),
  fuelType: z.string().default("Coal"),
  cycleNumber: z.coerce.number().int().min(1),
  notes: z.string().optional(),
});

export const salesAgentSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  phone: phoneSchema,
  commissionPct: z.coerce.number().min(0).max(50).default(2),
  isActive: z.boolean().optional(),
});

export const rateCardSchema = z.object({
  brickGrade: z.enum(["RAW", "COOKED", "BROKEN", "GRADE_A", "GRADE_B"]),
  customerType: customerTypeEnum.optional().nullable(),
  ratePerBrick: z.coerce.number().positive(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const kilnSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  nameUr: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const kilnBatchSchema = z.object({
  kilnId: z.string().min(1),
  batchNumber: z.coerce.number().int().min(1).optional(),
  status: z.enum(["LOADING", "FIRING", "COOLING", "UNLOADED", "CANCELLED"]).optional(),
  loadDate: z.string(),
  bricksIn: z.coerce.number().int().min(0).optional(),
  bricksOutA: z.coerce.number().int().min(0).optional(),
  bricksOutB: z.coerce.number().int().min(0).optional(),
  broken: z.coerce.number().int().min(0).optional(),
  temperature: z.coerce.number().optional(),
  fuelUsed: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  notes: z.string().optional(),
});

export const vehicleSchema = z.object({
  registration: z.string().min(3),
  label: z.string().optional(),
  driverName: z.string().min(2),
  driverPhone: phoneSchema.optional().or(z.literal("")),
  driverWorkerId: z.string().optional().nullable(),
  capacityBricks: z.coerce.number().int().positive().default(5000),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export const dispatchDeliverySchema = z.object({
  deliveryStatus: z.enum(["PENDING", "IN_TRANSIT", "DELIVERED", "RETURNED"]),
  receiverName: z.string().optional(),
  receiverCnic: z.string().optional(),
  biltyNo: z.string().optional(),
  transporterName: z.string().optional(),
  freightAmount: z.coerce.number().min(0).optional(),
});

export const invoiceSchema = z.object({
  orderId: z.string().min(1),
  taxAmount: z.coerce.number().min(0).optional(),
  ntn: z.string().optional(),
  notes: z.string().optional(),
});

export const customerPaymentSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export const payrollSchema = z.object({
  workerId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
  baseSalary: z.coerce.number().min(0),
  brickBonus: z.coerce.number().min(0).optional(),
  overtimePay: z.coerce.number().min(0).optional(),
  deductions: z.coerce.number().min(0).optional(),
  isPaid: z.boolean().optional(),
});

export const payrollAutoSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
  workerIds: z.array(z.string()).optional(),
  deductAdvance: z.boolean().optional().default(true),
  skipPaid: z.boolean().optional().default(true),
  skipEmpty: z.boolean().optional().default(false),
});
