import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, withAuth } from "@/lib/api-utils";
import { exportAttendancePdf, exportFinancePdf, exportWorkersPdf, exportInventoryPdf } from "@/lib/reports-export";
import { formatPKR } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { startOfDay } from "date-fns";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    const type = req.nextUrl.searchParams.get("type") || "attendance";
    const format = req.nextUrl.searchParams.get("format") || "pdf";

    try {
      if (type === "attendance") {
        const today = startOfDay(new Date());
        const records = await prisma.attendance.findMany({
          where: { date: today },
          include: { worker: { select: { name: true, department: true } } },
        });
        const rows = records.map((r) => ({
          name: r.worker.name,
          status: r.status,
          department: r.worker.department,
          qr: r.qrScanned,
        }));

        if (format === "xlsx") {
          const ws = XLSX.utils.json_to_sheet(
            rows.map((r) => ({
              Worker: r.name,
              Department: r.department,
              Status: r.status,
              QR: r.qr ? "Yes" : "No",
            }))
          );
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Attendance");
          const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition": `attachment; filename="attendance-${formatDate(today)}.xlsx"`,
            },
          });
        }

        const pdf = exportAttendancePdf(rows, formatDate(today));
        return new NextResponse(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="attendance-${formatDate(today)}.pdf"`,
          },
        });
      }

      if (type === "finance") {
        const transactions = await prisma.transaction.findMany({
          orderBy: { date: "desc" },
          take: 100,
        });
        const expenses = await prisma.expense.findMany({ take: 50 });
        const income = transactions
          .filter((t) => t.type === "INCOME" || t.type === "CUSTOMER_PAYMENT")
          .reduce((s, t) => s + Number(t.amount), 0);
        const expenseTotal =
          expenses.reduce((s, e) => s + Number(e.amount), 0) +
          transactions
            .filter((t) => ["EXPENSE", "SALARY", "SUPPLIER_PAYMENT"].includes(t.type))
            .reduce((s, t) => s + Number(t.amount), 0);

        const rows = [
          ...transactions.map((t) => [
            formatDate(t.date),
            t.description,
            `${t.type === "INCOME" || t.type === "CUSTOMER_PAYMENT" ? "+" : "-"}${Number(t.amount).toLocaleString()}`,
          ]),
          ...expenses.map((e) => [
            formatDate(e.date),
            e.title,
            `-${Number(e.amount).toLocaleString()}`,
          ]),
        ];

        if (format === "xlsx") {
          const ws = XLSX.utils.aoa_to_sheet([["Date", "Description", "Amount"], ...rows]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Finance");
          const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition": 'attachment; filename="finance-report.xlsx"',
            },
          });
        }

        const pdf = exportFinancePdf(rows, {
          income,
          expense: expenseTotal,
          net: income - expenseTotal,
        });
        return new NextResponse(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="finance-report.pdf"',
          },
        });
      }

      if (type === "workers") {
        const workers = await prisma.worker.findMany({ orderBy: { name: "asc" } });
        const active = workers.filter((w) => w.isActive).length;
        const rows = workers.map((w) => [
          w.workerCode ?? "—",
          w.name,
          w.cnic,
          w.phone,
          formatPKR(Number(w.dailyWage)),
          formatPKR(Number(w.advanceBalance)),
          w.isActive ? "Active" : "Inactive",
        ]);

        if (format === "xlsx") {
          const ws = XLSX.utils.json_to_sheet(
            workers.map((w) => ({
              Code: w.workerCode,
              Name: w.name,
              CNIC: w.cnic,
              Phone: w.phone,
              Wage: Number(w.dailyWage),
              Advance: Number(w.advanceBalance),
              Status: w.isActive ? "Active" : "Inactive",
            }))
          );
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Workers");
          const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition": 'attachment; filename="workers-report.xlsx"',
            },
          });
        }

        const pdf = exportWorkersPdf(rows, { total: workers.length, active });
        return new NextResponse(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="workers-report.pdf"',
          },
        });
      }

      if (type === "inventory") {
        const inventory = await prisma.brickInventory.findMany({ orderBy: { grade: "asc" } });
        const total = inventory.reduce((s, i) => s + i.quantity, 0);
        const rows = inventory.map((i) => [i.grade, String(i.quantity)]);

        if (format === "xlsx") {
          const ws = XLSX.utils.json_to_sheet(
            inventory.map((i) => ({ Grade: i.grade, Quantity: i.quantity }))
          );
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Inventory");
          const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition": 'attachment; filename="inventory-report.xlsx"',
            },
          });
        }

        const pdf = exportInventoryPdf(rows, total);
        return new NextResponse(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
          },
        });
      }

      return apiError("Unknown report type", 400);
    } catch {
      return apiError("Database not available", 503);
    }
  }, "MANAGER");
}
