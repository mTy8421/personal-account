"use server";

import prisma from "@/lib/prisma";

/**
 * คำนวณและปรับปรุงยอดคงเหลือ (currentBalance) ของบัญชีจากประวัติธุรกรรมทั้งหมด
 * currentBalance = initialBalance + SUM(INCOME) - SUM(EXPENSE) + SUM(TRANSFER_IN) - SUM(TRANSFER_OUT)
 */
export async function recalculateAccountBalance(accountId: string) {
  return await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error("ไม่พบบัญชีที่ระบุ");

    // รายรับ
    const incomeAgg = await tx.transaction.aggregate({
      where: {
        accountId: accountId,
        type: "INCOME",
      },
      _sum: { amount: true },
    });

    // รายจ่าย
    const expenseAgg = await tx.transaction.aggregate({
      where: {
        accountId: accountId,
        type: "EXPENSE",
      },
      _sum: { amount: true },
    });

    // โอนออก (จากบัญชีนี้)
    const transferOutAgg = await tx.transaction.aggregate({
      where: {
        accountId: accountId,
        type: "TRANSFER",
      },
      _sum: { amount: true },
    });

    // โอนเข้า (มายังบัญชีนี้)
    const transferInAgg = await tx.transaction.aggregate({
      where: {
        toAccountId: accountId,
        type: "TRANSFER",
      },
      _sum: { amount: true },
    });

    const income = incomeAgg._sum.amount || 0;
    const expense = expenseAgg._sum.amount || 0;
    const transferOut = transferOutAgg._sum.amount || 0;
    const transferIn = transferInAgg._sum.amount || 0;

    const calculatedBalance =
      account.initialBalance + income - expense - transferOut + transferIn;

    const updated = await tx.account.update({
      where: { id: accountId },
      data: {
        currentBalance: Math.round(calculatedBalance * 100) / 100,
      },
    });

    return updated;
  });
}

/**
 * ปรับปรุงยอดคงเหลือของทุกบัญชีในระบบ
 */
export async function reconcileAllAccounts() {
  const accounts = await prisma.account.findMany({ select: { id: true } });
  for (const acc of accounts) {
    await recalculateAccountBalance(acc.id);
  }
  return { success: true, count: accounts.length };
}
