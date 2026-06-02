import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAttendancePdf(
  records: { name: string; status: string; department: string; qr: boolean }[],
  date: string
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Smart Brick Agency - Attendance Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Date: ${date} | Al-Rahman Bhatha, Sheikhupura`, 14, 28);
  autoTable(doc, {
    startY: 35,
    head: [["Worker", "Department", "Status", "QR"]],
    body: records.map((r) => [r.name, r.department, r.status, r.qr ? "Yes" : "No"]),
  });
  return doc.output("arraybuffer");
}

export function exportFinancePdf(
  rows: string[][],
  summary: { income: number; expense: number; net: number }
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Financial Ledger Report", 14, 20);
  doc.text(
    `Income: PKR ${summary.income.toLocaleString()} | Expense: PKR ${summary.expense.toLocaleString()} | Net: PKR ${summary.net.toLocaleString()}`,
    14,
    28
  );
  autoTable(doc, {
    startY: 35,
    head: [["Date", "Description", "Amount (PKR)"]],
    body: rows,
  });
  return doc.output("arraybuffer");
}

export function exportWorkersPdf(
  rows: string[][],
  summary: { total: number; active: number }
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Smart Brick Agency - Workers Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Total: ${summary.total} | Active: ${summary.active}`, 14, 28);
  autoTable(doc, {
    startY: 35,
    head: [["Code", "Name", "CNIC", "Phone", "Wage", "Advance", "Status"]],
    body: rows,
  });
  return doc.output("arraybuffer");
}

export function exportInventoryPdf(rows: string[][], total: number) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Smart Brick Agency - Inventory Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Total bricks in stock: ${total.toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 35,
    head: [["Grade", "Quantity"]],
    body: rows,
  });
  return doc.output("arraybuffer");
}
