"use server";

import prisma from "@/lib/prisma";
import { FilterParams } from "@/lib/types";
import { safeRevalidatePath } from "@/lib/utils/revalidate";

export async function getTransactions(filters: FilterParams = {}) {
  const {
    type,
    accountId,
    categoryId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 15,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  const where: any = {};

  if (type && type !== "ALL") {
    where.type = type;
  }

  if (accountId && accountId !== "ALL") {
    where.OR = [{ accountId: accountId }, { toAccountId: accountId }];
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      where.date.lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { note: { contains: term } },
          { category: { name: { contains: term } } },
          { account: { name: { contains: term } } },
        ],
      },
    ];
  }

  const [totalCount, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    transactions,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
  };
}

export async function createTransaction(data: {
  accountId: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  date: Date | string;
  note?: string | null;
}) {
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("จำนวนเงินต้องมากกว่า 0");
  }

  if (!data.accountId) {
    throw new Error("กรุณาเลือกบัญชี");
  }

  if (data.type === "TRANSFER") {
    if (!data.toAccountId) {
      throw new Error("กรุณาเลือกบัญชีปลายทางสำหรับการโอนเงิน");
    }
    if (data.accountId === data.toAccountId) {
      throw new Error("ไม่สามารถโอนเงินไปยังบัญชีเดียวกันได้");
    }
  } else if (!data.categoryId) {
    throw new Error("กรุณาเลือกหมวดหมู่");
  }

  const txDate = new Date(data.date);

  const result = await prisma.$transaction(async (tx) => {
    // 1. สร้าง Transaction
    const newTx = await tx.transaction.create({
      data: {
        accountId: data.accountId,
        toAccountId: data.type === "TRANSFER" ? data.toAccountId : null,
        categoryId: data.type !== "TRANSFER" ? data.categoryId : null,
        type: data.type,
        amount: amount,
        date: txDate,
        note: data.note?.trim() || null,
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    // 2. ปรับยอดเงินตามประเภท
    if (data.type === "EXPENSE") {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { decrement: amount } },
      });
    } else if (data.type === "INCOME") {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { increment: amount } },
      });
    } else if (data.type === "TRANSFER" && data.toAccountId) {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { decrement: amount } },
      });
      await tx.account.update({
        where: { id: data.toAccountId },
        data: { currentBalance: { increment: amount } },
      });
    }

    return newTx;
  });

  safeRevalidatePath("/dashboard");
  safeRevalidatePath("/transactions");
  safeRevalidatePath("/accounts");
  safeRevalidatePath("/reports");
  safeRevalidatePath("/budgets");

  return result;
}

export async function updateTransaction(
  id: string,
  data: {
    accountId: string;
    toAccountId?: string | null;
    categoryId?: string | null;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amount: number;
    date: Date | string;
    note?: string | null;
  }
) {
  const newAmount = Number(data.amount);
  if (isNaN(newAmount) || newAmount <= 0) {
    throw new Error("จำนวนเงินต้องมากกว่า 0");
  }

  return await prisma.$transaction(async (tx) => {
    const oldTx = await tx.transaction.findUnique({
      where: { id },
    });
    if (!oldTx) throw new Error("ไม่พบรายการที่ต้องการแก้ไข");

    // 1. คืนค่ายอดเงินเดิม (Revert previous effect)
    if (oldTx.type === "EXPENSE") {
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { increment: oldTx.amount } },
      });
    } else if (oldTx.type === "INCOME") {
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { decrement: oldTx.amount } },
      });
    } else if (oldTx.type === "TRANSFER" && oldTx.toAccountId) {
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { increment: oldTx.amount } },
      });
      await tx.account.update({
        where: { id: oldTx.toAccountId },
        data: { currentBalance: { decrement: oldTx.amount } },
      });
    }

    // 2. ปรับยอดเงินตามรายการใหม่ (Apply new effect)
    if (data.type === "EXPENSE") {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { decrement: newAmount } },
      });
    } else if (data.type === "INCOME") {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { increment: newAmount } },
      });
    } else if (data.type === "TRANSFER" && data.toAccountId) {
      await tx.account.update({
        where: { id: data.accountId },
        data: { currentBalance: { decrement: newAmount } },
      });
      await tx.account.update({
        where: { id: data.toAccountId },
        data: { currentBalance: { increment: newAmount } },
      });
    }

    // 3. บันทึก Transaction ที่แก้ไข
    const updated = await tx.transaction.update({
      where: { id },
      data: {
        accountId: data.accountId,
        toAccountId: data.type === "TRANSFER" ? data.toAccountId : null,
        categoryId: data.type !== "TRANSFER" ? data.categoryId : null,
        type: data.type,
        amount: newAmount,
        date: new Date(data.date),
        note: data.note?.trim() || null,
      },
    });

    return updated;
  });
}

export async function deleteTransaction(id: string) {
  const result = await prisma.$transaction(async (tx) => {
    const oldTx = await tx.transaction.findUnique({
      where: { id },
    });
    if (!oldTx) throw new Error("ไม่พบรายการที่ต้องการลบ");

    // คืนค่ายอดเงินเดิม
    if (oldTx.type === "EXPENSE") {
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { increment: oldTx.amount } },
      });
    } else if (oldTx.type === "INCOME") {
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { decrement: oldTx.amount } },
      });
    } else if (oldTx.type === "TRANSFER" && oldTx.toAccountId) {
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { currentBalance: { increment: oldTx.amount } },
      });
      await tx.account.update({
        where: { id: oldTx.toAccountId },
        data: { currentBalance: { decrement: oldTx.amount } },
      });
    }

    // ลบรายการ
    await tx.transaction.delete({
      where: { id },
    });

    return { success: true };
  });

  safeRevalidatePath("/dashboard");
  safeRevalidatePath("/transactions");
  safeRevalidatePath("/accounts");
  safeRevalidatePath("/reports");
  safeRevalidatePath("/budgets");

  return result;
}

export async function getDashboardStats() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // 1. ดึงบัญชีที่ active ทั้งหมด
  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  // 2. รายรับ-รายจ่ายของเดือนนี้
  const [monthIncomeAgg, monthExpenseAgg, monthTxCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  const monthIncome = monthIncomeAgg._sum.amount || 0;
  const monthExpense = monthExpenseAgg._sum.amount || 0;
  const monthNet = monthIncome - monthExpense;

  // 3. สัดส่วนรายจ่ายตามหมวดหมู่เดือนนี้
  const expenseTransactions = await prisma.transaction.findMany({
    where: {
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
      categoryId: { not: null },
    },
    include: { category: true },
  });

  const categoryMap = new Map<
    string,
    { name: string; color: string; icon: string; amount: number }
  >();

  for (const tx of expenseTransactions) {
    if (!tx.category) continue;
    const catId = tx.category.id;
    const existing = categoryMap.get(catId) || {
      name: tx.category.name,
      color: tx.category.color,
      icon: tx.category.icon,
      amount: 0,
    };
    existing.amount += tx.amount;
    categoryMap.set(catId, existing);
  }

  const categoryExpenses = Array.from(categoryMap.values())
    .map((item) => ({
      categoryName: item.name,
      color: item.color,
      icon: item.icon,
      amount: item.amount,
      percentage: monthExpense > 0 ? Math.round((item.amount / monthExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 4. แนวโน้มรายรับ/รายจ่าย ย้อนหลัง 6 เดือน
  const monthlyTrend = [];
  const THAI_MONTHS_SHORT = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(year, month - i, 1);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const sDate = new Date(y, m, 1, 0, 0, 0, 0);
    const eDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "INCOME", date: { gte: sDate, lte: eDate } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", date: { gte: sDate, lte: eDate } },
        _sum: { amount: true },
      }),
    ]);

    const incomeVal = inc._sum.amount || 0;
    const expenseVal = exp._sum.amount || 0;

    monthlyTrend.push({
      month: `${THAI_MONTHS_SHORT[m]} ${String(y).slice(-2)}`,
      income: incomeVal,
      expense: expenseVal,
      net: incomeVal - expenseVal,
    });
  }

  // 5. รายการล่าสุด 8 รายการ
  const recentTransactions = await prisma.transaction.findMany({
    take: 8,
    orderBy: { date: "desc" },
    include: {
      account: true,
      toAccount: true,
      category: true,
    },
  });

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    monthNet,
    monthTransactionCount: monthTxCount,
    accounts,
    categoryExpenses,
    monthlyTrend,
    recentTransactions,
  };
}
