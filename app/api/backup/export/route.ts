import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { formatThaiNumericDate } from "@/lib/utils/date";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const dateStr = new Date().toISOString().split("T")[0];

    // อัปเดตเวลา Backup ล่าสุด
    await prisma.appConfig.upsert({
      where: { id: "default" },
      update: { lastBackupAt: new Date() },
      create: { id: "default", lastBackupAt: new Date() },
    });

    if (format === "sqlite") {
      const dbPath = path.resolve(process.cwd(), "data", "database.db");
      if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: "ไม่พบไฟล์ฐานข้อมูล SQLite" }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(dbPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="expense-tracker-db-${dateStr}.db"`,
          "Content-Type": "application/x-sqlite3",
        },
      });
    }

    if (format === "csv") {
      const transactions = await prisma.transaction.findMany({
        include: {
          account: true,
          toAccount: true,
          category: true,
        },
        orderBy: { date: "desc" },
      });

      // สร้างหัวตาราง CSV
      const headers = [
        "ID",
        "วันที่",
        "ประเภท",
        "บัญชี",
        "บัญชีปลายทาง",
        "หมวดหมู่",
        "จำนวนเงิน",
        "หมายเหตุ",
      ];

      const rows = transactions.map((t) => [
        t.id,
        formatThaiNumericDate(t.date),
        t.type === "INCOME" ? "รายรับ" : t.type === "EXPENSE" ? "รายจ่าย" : "โอนเงิน",
        `"${(t.account?.name || "").replace(/"/g, '""')}"`,
        `"${(t.toAccount?.name || "").replace(/"/g, '""')}"`,
        `"${(t.category?.name || "").replace(/"/g, '""')}"`,
        t.amount.toFixed(2),
        `"${(t.note || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="transactions-${dateStr}.csv"`,
          "Content-Type": "text/csv; charset=utf-8",
        },
      });
    }

    // Default: JSON Export (Full Snapshot)
    const [accounts, categories, transactions, budgets, recurringExpenses, appConfig] =
      await Promise.all([
        prisma.account.findMany(),
        prisma.category.findMany(),
        prisma.transaction.findMany(),
        prisma.budget.findMany(),
        prisma.recurringExpense.findMany(),
        prisma.appConfig.findUnique({ where: { id: "default" } }),
      ]);

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appConfig,
      accounts,
      categories,
      transactions,
      budgets,
      recurringExpenses,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="expense-tracker-backup-${dateStr}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Backup export error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการสำรองข้อมูล" }, { status: 500 });
  }
}
