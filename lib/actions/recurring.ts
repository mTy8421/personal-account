"use server";

import prisma from "@/lib/prisma";
import { safeRevalidatePath } from "@/lib/utils/revalidate";
import { createTransaction } from "./transactions";

export async function getRecurringExpenses() {
  return await prisma.recurringExpense.findMany({
    include: {
      category: true,
      account: true,
    },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function createRecurringExpense(data: {
  name: string;
  amount: number;
  type?: "EXPENSE" | "INCOME";
  categoryId: string;
  accountId: string;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  dayOfMonth?: number;
  nextDueDate: Date | string;
}) {
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) throw new Error("จำนวนเงินต้องมากกว่า 0");

  const recurring = await prisma.recurringExpense.create({
    data: {
      name: data.name,
      amount,
      type: data.type || "EXPENSE",
      categoryId: data.categoryId,
      accountId: data.accountId,
      frequency: data.frequency || "MONTHLY",
      dayOfMonth: data.dayOfMonth || 1,
      nextDueDate: new Date(data.nextDueDate),
      isActive: true,
    },
  });

  safeRevalidatePath("/recurring");
  return recurring;
}

export async function updateRecurringExpense(
  id: string,
  data: {
    name?: string;
    amount?: number;
    type?: string;
    categoryId?: string;
    accountId?: string;
    frequency?: string;
    dayOfMonth?: number;
    nextDueDate?: Date | string;
    isActive?: boolean;
  }
) {
  const updated = await prisma.recurringExpense.update({
    where: { id },
    data: {
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : undefined,
      nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
    },
  });

  safeRevalidatePath("/recurring");
  return updated;
}

export async function deleteRecurringExpense(id: string) {
  await prisma.recurringExpense.delete({ where: { id } });
  safeRevalidatePath("/recurring");
  return { success: true };
}

/**
 * บันทึก Transaction สำหรับรายการประจำ และเลื่อนวันครบกำหนดถัดไป
 */
export async function processRecurringExpense(id: string) {
  const item = await prisma.recurringExpense.findUnique({
    where: { id },
    include: { category: true, account: true },
  });

  if (!item || !item.isActive) throw new Error("ไม่พบรายการประจำหรือรายการไม่ได้เปิดใช้งาน");

  // 1. สร้าง Transaction
  await createTransaction({
    accountId: item.accountId,
    categoryId: item.categoryId,
    type: item.type as "INCOME" | "EXPENSE",
    amount: item.amount,
    date: new Date(),
    note: `[รายการประจำ] ${item.name}`,
  });

  // 2. คำนวณวันครบกำหนดถัดไป
  const currentNext = new Date(item.nextDueDate);
  const nextDate = new Date(currentNext);

  if (item.frequency === "DAILY") {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (item.frequency === "WEEKLY") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (item.frequency === "YEARLY") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    // MONTHLY
    nextDate.setMonth(nextDate.getMonth() + 1);
    if (item.dayOfMonth) {
      nextDate.setDate(item.dayOfMonth);
    }
  }

  await prisma.recurringExpense.update({
    where: { id },
    data: {
      lastRunDate: new Date(),
      nextDueDate: nextDate,
    },
  });

  safeRevalidatePath("/recurring");
  safeRevalidatePath("/dashboard");
  safeRevalidatePath("/transactions");

  return { success: true };
}
