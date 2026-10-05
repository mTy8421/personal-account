import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { reconcileAllAccounts } from "@/lib/actions/balance";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = formData.get("format") as string | null;

    if (!file) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์สำหรับกู้คืน" }, { status: 400 });
    }

    if (format === "sqlite" || file.name.endsWith(".db")) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // ตรวจสอบ Magic bytes ของ SQLite: "SQLite format 3\0"
      const header = buffer.subarray(0, 16).toString("utf-8");
      if (!header.startsWith("SQLite format 3")) {
        return NextResponse.json({ error: "ไฟล์ไม่ใช่รูปแบบ SQLite Database ที่ถูกต้อง" }, { status: 400 });
      }

      const dbPath = path.resolve(process.cwd(), "data", "database.db");
      // เขียนไฟล์ทับ
      fs.writeFileSync(dbPath, buffer);

      // Reconcile balances
      await reconcileAllAccounts();

      return NextResponse.json({
        success: true,
        message: "กู้คืนฐานข้อมูล SQLite สำเร็จแล้ว",
      });
    }

    // JSON Format Restore
    const fileContent = await file.text();
    let data: any;
    try {
      data = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: "ไฟล์ JSON เสียหายหรือไม่ถูกต้อง" }, { status: 400 });
    }

    if (!data.accounts || !Array.isArray(data.accounts)) {
      return NextResponse.json({ error: "โครงสร้างไฟล์สำรองข้อมูล JSON ไม่ถูกต้อง" }, { status: 400 });
    }

    // ดำเนินการ Restore ภายใน Transaction
    await prisma.$transaction(async (tx) => {
      // 1. ลบข้อมูลเดิมทั้งหมดตามลำดับความสัมพันธ์
      await tx.transaction.deleteMany();
      await tx.recurringExpense.deleteMany();
      await tx.budget.deleteMany();
      await tx.category.deleteMany();
      await tx.account.deleteMany();

      // 2. นำเข้า Accounts
      for (const acc of data.accounts) {
        await tx.account.create({
          data: {
            id: acc.id,
            name: acc.name,
            type: acc.type,
            initialBalance: Number(acc.initialBalance) || 0,
            currentBalance: Number(acc.currentBalance) || 0,
            currency: acc.currency || "THB",
            color: acc.color || "#3b82f6",
            isActive: acc.isActive ?? true,
            createdAt: acc.createdAt ? new Date(acc.createdAt) : new Date(),
            updatedAt: acc.updatedAt ? new Date(acc.updatedAt) : new Date(),
          },
        });
      }

      // 3. นำเข้า Categories
      if (Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          await tx.category.create({
            data: {
              id: cat.id,
              name: cat.name,
              type: cat.type,
              icon: cat.icon || "Tag",
              color: cat.color || "#64748b",
              isActive: cat.isActive ?? true,
              createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
              updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
            },
          });
        }
      }

      // 4. นำเข้า Budgets
      if (Array.isArray(data.budgets)) {
        for (const b of data.budgets) {
          await tx.budget.create({
            data: {
              id: b.id,
              categoryId: b.categoryId,
              amount: Number(b.amount) || 0,
              month: Number(b.month),
              year: Number(b.year),
              createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
              updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
            },
          });
        }
      }

      // 5. นำเข้า Recurring Expenses
      if (Array.isArray(data.recurringExpenses)) {
        for (const r of data.recurringExpenses) {
          await tx.recurringExpense.create({
            data: {
              id: r.id,
              name: r.name,
              amount: Number(r.amount) || 0,
              type: r.type || "EXPENSE",
              categoryId: r.categoryId,
              accountId: r.accountId,
              frequency: r.frequency || "MONTHLY",
              dayOfMonth: r.dayOfMonth || 1,
              dayOfWeek: r.dayOfWeek,
              lastRunDate: r.lastRunDate ? new Date(r.lastRunDate) : null,
              nextDueDate: r.nextDueDate ? new Date(r.nextDueDate) : new Date(),
              isActive: r.isActive ?? true,
              createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
            },
          });
        }
      }

      // 6. นำเข้า Transactions
      if (Array.isArray(data.transactions)) {
        for (const t of data.transactions) {
          await tx.transaction.create({
            data: {
              id: t.id,
              accountId: t.accountId,
              toAccountId: t.toAccountId || null,
              categoryId: t.categoryId || null,
              type: t.type,
              amount: Number(t.amount) || 0,
              date: t.date ? new Date(t.date) : new Date(),
              note: t.note || null,
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
            },
          });
        }
      }

      // 7. นำเข้าหรือคงค่า AppConfig
      if (data.appConfig) {
        await tx.appConfig.upsert({
          where: { id: "default" },
          update: {
            isPinEnabled: data.appConfig.isPinEnabled ?? false,
            pinHash: data.appConfig.pinHash ?? null,
            pinSalt: data.appConfig.pinSalt ?? null,
            currency: data.appConfig.currency || "THB",
            theme: data.appConfig.theme || "system",
            lastBackupAt: new Date(),
          },
          create: {
            id: "default",
            isPinEnabled: data.appConfig.isPinEnabled ?? false,
            pinHash: data.appConfig.pinHash ?? null,
            pinSalt: data.appConfig.pinSalt ?? null,
            currency: data.appConfig.currency || "THB",
            theme: data.appConfig.theme || "system",
            lastBackupAt: new Date(),
          },
        });
      }
    });

    // ปรับปรุงยอดคงเหลือทุกบัญชีให้แม่นยำ 100%
    await reconcileAllAccounts();

    return NextResponse.json({
      success: true,
      message: "กู้คืนข้อมูลจากไฟล์ JSON สำเร็จเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Backup restore error:", error);
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการกู้คืนข้อมูล" }, { status: 500 });
  }
}
