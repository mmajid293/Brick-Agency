/**
 * Generates docs/Smart-Brick-Agency-Project-Overview.pdf
 * Run: npm run docs:pdf
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "Smart-Brick-Agency-Project-Overview.pdf");

const BRAND = "Smart Brick Agency";
const SUB = "Brick Kiln / Agency ERP — Complete Project Overview";
const FOOTER = "Pakistani brick kiln (Bhatha) management system | Version 0.1.0";

type Doc = jsPDF & {
  lastAutoTable?: { finalY: number };
};

function newPageIfNeeded(doc: Doc, need: number) {
  const y = doc.lastAutoTable?.finalY ?? (doc as jsPDF).getY?.() ?? 40;
  if (y + need > 275) {
    doc.addPage();
    return 20;
  }
  return y + (doc.lastAutoTable ? 12 : 0);
}

function sectionTitle(doc: Doc, title: string, y: number) {
  doc.setFillColor(234, 88, 12);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, 16, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  return y + 10;
}

function bodyText(doc: Doc, lines: string[], startY: number) {
  doc.setFontSize(9);
  let y = startY;
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, 180);
    if (y + wrapped.length * 4.5 > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(wrapped, 14, y);
    y += wrapped.length * 4.5 + 2;
  }
  return y;
}

function table(
  doc: Doc,
  head: string[],
  body: string[][],
  startY: number,
  colWidths?: Record<number, number>
) {
  autoTable(doc, {
    startY,
    head: [head],
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255 },
    alternateRowStyles: { fillColor: [255, 247, 237] },
    margin: { left: 14, right: 14 },
    columnStyles: colWidths,
  });
  return doc.lastAutoTable?.finalY ?? startY + 20;
}

function buildPdf(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as Doc;
  const date = new Date().toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Cover
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, 210, 297, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND, 105, 90, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(SUB, 105, 105, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated: ${date}`, 105, 120, { align: "center" });
  doc.text("http://localhost:3000", 105, 128, { align: "center" });
  doc.setFontSize(9);
  doc.text(FOOTER, 105, 250, { align: "center" });

  doc.addPage();
  let y = 20;

  y = sectionTitle(doc, "1. Languages & Technologies", y);
  y = table(
    doc,
    ["Layer", "Technology", "Role"],
    [
      ["Primary language", "TypeScript", "App logic, APIs, UI, types"],
      ["Runtime", "JavaScript (Node.js)", "Runs the server"],
      ["UI", "React 19 + Next.js 16", "Pages, dashboard, API routes"],
      ["Styling", "Tailwind CSS 4", "Layout and design"],
      ["Database", "PostgreSQL", "All business data"],
      ["ORM", "Prisma", "Tables and queries"],
      ["Validation", "Zod", "Forms and API inputs"],
      ["Auth", "JWT + bcrypt", "Login sessions"],
      ["Scripts", "PowerShell / Bash", "Windows/Linux setup"],
      ["Container", "Docker", "PostgreSQL on port 5434"],
      ["Exports", "jsPDF, xlsx", "PDF and Excel reports"],
      ["i18n", "Urdu + English", "UI language toggle in app"],
    ],
    y,
    { 0: { cellWidth: 38 }, 1: { cellWidth: 42 }, 2: { cellWidth: 100 } }
  );

  y = newPageIfNeeded(doc, 80);
  y = sectionTitle(doc, "2. Windows PC — Setup Guide", y);
  y = bodyText(doc, [
    "Install: Node.js 20+ LTS, Docker Desktop, Chrome or Edge browser.",
    "Verify in PowerShell: node -v, npm -v, docker -v",
  ], y);

  y = table(
    doc,
    ["Step", "Command / Action"],
    [
      ["1. Open project folder", "cd C:\\Projects\\smart-bhatha-erp"],
      ["2. Install packages", "npm install"],
      ["3. Environment file", "copy .env.example .env"],
      ["4. Database + demo data", "powershell -ExecutionPolicy Bypass -File scripts\\setup-db.ps1"],
      ["5. Start app", "npm run dev"],
      ["6. Open browser", "http://localhost:3000"],
    ],
    y
  );

  y = newPageIfNeeded(doc, 50);
  y = sectionTitle(doc, "Daily Use (Windows)", y);
  y = bodyText(
    doc,
    [
      "1. Start Docker Desktop.",
      "2. Double-click Start-SmartBhatha.bat — keep the server window open.",
      "3. Log in when the browser opens.",
      "4. Optional: Install site as app in Edge or Chrome and pin to taskbar.",
    ],
    y
  );

  y = table(
    doc,
    ["Command", "Purpose"],
    [
      ["npm run dev", "Development server"],
      ["npm run build", "Production build"],
      ["npm run start", "Run production"],
      ["npm run db:setup:win", "Database + seed (Windows)"],
      ["npm run db:seed", "Reload demo data"],
      ["npm run db:studio", "Visual database browser"],
    ],
    y
  );

  y = newPageIfNeeded(doc, 60);
  y = sectionTitle(doc, "3. Use as Desktop App", y);
  y = bodyText(
    doc,
    [
      "This is a local web application. Install it from the browser for an app-like window.",
      "Edge: Menu (...) > Apps > Install this site as an app > Name: Smart Brick Agency",
      "Chrome: Install icon in address bar > Pin to taskbar",
      "You must still run Docker + the Node server each time you use the PC.",
      "LAN access: Other PCs use http://YOUR-IP:3000 (allow port 3000 in Windows Firewall).",
    ],
    y
  );

  y = newPageIfNeeded(doc, 50);
  y = sectionTitle(doc, "4. Login Accounts (after seed)", y);
  y = table(
    doc,
    ["Role", "Email", "Password", "Access"],
    [
      ["Admin", "admin@bhatha.pk", "admin123", "Full system, users, audit"],
      ["Manager", "manager@bhatha.pk", "manager123", "Operations and sales"],
      ["Accountant", "accountant@bhatha.pk", "accountant123", "Finance, payroll, invoices"],
      ["Supervisor", "supervisor@bhatha.pk", "supervisor123", "Workers, attendance, dispatch"],
      ["Worker", "worker@bhatha.pk", "worker123", "Worker portal only"],
    ],
    y,
    { 0: { cellWidth: 22 }, 1: { cellWidth: 48 }, 2: { cellWidth: 28 }, 3: { cellWidth: 82 } }
  );

  doc.addPage();
  y = 20;
  y = sectionTitle(doc, "5. Complete Feature List", y);

  const features: [string, string][] = [
    ["Home dashboard", "KPIs: bricks, attendance, sales, kiln, fuel, alerts"],
    ["Today report", "Detailed daily snapshot"],
    ["Reports export", "PDF / Excel: attendance, finance, workers, inventory"],
    ["Urdu / English + dark mode", "Language and theme"],
    ["16 worker groups", "Molding, kiln, wood, loaders, drivers, helpers, etc."],
    ["Worker management", "CNIC, wages, targets, supervisor, categories"],
    ["Attendance", "Check-in/out, overtime, work reports, QR scan"],
    ["Auto payroll", "From attendance + piece-rate + OT + truck trips"],
    ["Production", "Raw, cooked, Grade A/B, broken, wastage"],
    ["Multi-kiln + batches", "Loading > Firing > Cooling > Unloaded"],
    ["Brick inventory", "All grades, movements, low-stock alerts"],
    ["Raw materials", "Mitti, coal, wood, diesel, suppliers, purchases"],
    ["Customers & orders", "Builder, contractor, retailer, udhar balance"],
    ["Credit limit", "Block orders over customer limit"],
    ["Sales agents", "Commission on orders"],
    ["Rate card", "Brick prices by grade and customer type"],
    ["Invoices", "Tax invoice per order (NTN optional)"],
    ["Dispatch", "Multi-truck, auto challan, print challan"],
    ["Bilty & freight", "Transporter, bilty number, freight amount"],
    ["Fleet / vehicles", "Truck registration, driver, capacity"],
    ["Delivery status", "Pending, in transit, delivered"],
    ["Finance ledger", "Income, expense, salary transactions"],
    ["Payroll", "Manual + auto generate, advance deduction"],
    ["Worker portal", "Own attendance, pay history, check-in"],
    ["Settings", "Users, roles, passwords, audit log"],
  ];

  y = table(doc, ["Feature", "Description"], features, y);

  y = newPageIfNeeded(doc, 70);
  y = sectionTitle(doc, "6. Application Screens", y);
  y = table(
    doc,
    ["Screen", "URL path"],
    [
      ["Dashboard", "/dashboard"],
      ["Today report", "/dashboard/today"],
      ["Workers", "/dashboard/workers"],
      ["Attendance", "/dashboard/attendance"],
      ["Production", "/dashboard/production"],
      ["Kilns", "/dashboard/kilns"],
      ["Customers", "/dashboard/customers"],
      ["Sales agents", "/dashboard/agents"],
      ["Rate card", "/dashboard/rates"],
      ["Invoices", "/dashboard/invoices"],
      ["Finance", "/dashboard/finance"],
      ["Payroll", "/dashboard/payroll"],
      ["Brick inventory", "/dashboard/inventory"],
      ["Materials", "/dashboard/materials"],
      ["Dispatch", "/dashboard/dispatch"],
      ["New dispatch", "/dashboard/dispatch/new"],
      ["Fleet", "/dashboard/vehicles"],
      ["Reports", "/dashboard/reports"],
      ["Activity log", "/dashboard/audit"],
      ["Settings", "/dashboard/settings"],
      ["Worker portal", "/dashboard/portal"],
    ],
    y
  );

  y = newPageIfNeeded(doc, 50);
  y = sectionTitle(doc, "7. Database Modules", y);
  y = table(
    doc,
    ["Module", "Main tables"],
    [
      ["Auth", "User, AuditLog"],
      ["Organization", "Department, WorkerCategory"],
      ["HR", "Worker, Attendance, Payroll, Advance, ProductionLog, DispatchLog"],
      ["Production", "Production, Kiln, KilnBatch, KilnLog"],
      ["Inventory", "BrickInventory, InventoryMovement"],
      ["Materials", "RawMaterial, MaterialStockLog, Supplier, Purchase"],
      ["Sales", "Customer, Order, SalesAgent, AgentCommission, BrickRateCard, Invoice"],
      ["Logistics", "Vehicle, Dispatch"],
      ["Finance", "Transaction, Expense, Notification"],
    ],
    y
  );

  y = newPageIfNeeded(doc, 40);
  y = sectionTitle(doc, "8. System Requirements", y);
  y = table(
    doc,
    ["Item", "Recommended"],
    [
      ["OS", "Windows 10/11 (64-bit)"],
      ["RAM", "8 GB minimum (16 GB with Docker)"],
      ["Disk", "2 GB free space"],
      ["Software", "Node.js 20+, Docker Desktop, modern browser"],
      ["Network", "Local PC; optional LAN for other computers"],
    ],
    y
  );

  y = newPageIfNeeded(doc, 40);
  y = sectionTitle(doc, "9. Typical Daily Workflow", y);
  y = bodyText(
    doc,
    [
      "1. Supervisor — Mark attendance; check-out with bricks or truck loads.",
      "2. Production — Enter daily output; advance kiln batches.",
      "3. Sales — Create orders using rate card; assign sales agent if needed.",
      "4. Dispatch — Load trucks; print challan and record bilty/freight.",
      "5. Accountant — Receive payments; month-end auto payroll; mark paid.",
      "6. Manager — Review dashboard, today report, and exports.",
    ],
    y
  );

  y = newPageIfNeeded(doc, 30);
  y = sectionTitle(doc, "10. Environment Variables (.env)", y);
  y = table(
    doc,
    ["Variable", "Example", "Purpose"],
    [
      ["DATABASE_URL", "postgresql://bhatha:bhatha123@localhost:5434/smart_bhatha", "PostgreSQL connection"],
      ["JWT_SECRET", "long-random-string", "Session security"],
      ["JWT_EXPIRES_IN", "7d", "Login duration"],
      ["NEXT_PUBLIC_APP_URL", "http://localhost:3000", "App base URL"],
    ],
    y
  );

  // Page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    if (i === 1) continue;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`${BRAND} — Project Overview`, 14, 290);
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" });
  }

  return doc;
}

function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const doc = buildPdf();
  const buf = Buffer.from(doc.output("arraybuffer"));
  writeFileSync(OUT, buf);
  console.log(`PDF created: ${OUT}`);
  console.log(`Size: ${(buf.length / 1024).toFixed(1)} KB`);
}

main();
