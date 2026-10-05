"use server";

import prisma from "@/lib/prisma";
import { safeRevalidatePath } from "@/lib/utils/revalidate";
import { recalculateAccountBalance } from "./balance";

export async function getAccounts(onlyActive: boolean = true) {
  return await prisma.account.findMany({
    where: onlyActive ? { isActive: true } : {},
    include: {
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAccountById(id: string) {
  return await prisma.account.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 20,
        include: {
          category: true,
          toAccount: true,
        },
      },
    },
  });
}

export async function createAccount(data: {
  name: string;
  type: string;
  initialBalance: number;
  currency?: string;
  color?: string;
}) {
  const initial = Number(data.initialBalance) || 0;
  const newAccount = await prisma.account.create({
    data: {
      name: data.name,
      type: data.type,
      initialBalance: initial,
      currentBalance: initial,
      currency: data.currency || "THB",
      color: data.color || "#3b82f6",
      isActive: true,
    },
  });

  safeRevalidatePath("/accounts");
  safeRevalidatePath("/dashboard");
  safeRevalidatePath("/transactions");
  return newAccount;
}

export async function updateAccount(
  id: string,
  data: {
    name?: string;
    type?: string;
    initialBalance?: number;
    currency?: string;
    color?: string;
    isActive?: boolean;
  }
) {
  const existing = await prisma.account.findUnique({ where: { id } });
  if (!existing) throw new Error("ไม่พบบัญชี");

  await prisma.account.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      type: data.type !== undefined ? data.type : undefined,
      initialBalance:
        data.initialBalance !== undefined
          ? Number(data.initialBalance)
          : undefined,
      currency: data.currency !== undefined ? data.currency : undefined,
      color: data.color !== undefined ? data.color : undefined,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    },
  });

  // หากมีการแก้ initialBalance ให้คำนวณ currentBalance ใหม่
  if (data.initialBalance !== undefined) {
    await recalculateAccountBalance(id);
  }

  safeRevalidatePath("/accounts");
  safeRevalidatePath("/dashboard");
  safeRevalidatePath("/transactions");
  return { success: true };
}

export async function deleteAccount(id: string) {
  // ตรวจสอบว่ามีรายการในบัญชีหรือไม่
  const count = await prisma.transaction.count({
    where: {
      OR: [{ accountId: id }, { toAccountId: id }],
    },
  });

  if (count > 0) {
    // ซ่อนบัญชีแทนการลบถาวรหากมีธุรกรรมผูกอยู่ เพื่อรักษา Data Integrity
    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    await prisma.account.delete({
      where: { id },
    });
  }

  safeRevalidatePath("/accounts");
  safeRevalidatePath("/dashboard");
  safeRevalidatePath("/transactions");
  return { success: true };
}
