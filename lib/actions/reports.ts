"use server";

import prisma from "@/lib/prisma";
import { getMonthDateRange } from "@/lib/utils/date";

export async function getMonthlyReport(month: number, year: number) {
  const { start, end } = getMonthDateRange(year, month);

  const [incomeAgg, expenseAgg, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: { category: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;

  // รายจ่ายรายวัน
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayMap = new Map<number, number>();
  for (let i = 1; i <= daysInMonth; i++) {
    dayMap.set(i, 0);
  }

  // สัดส่วนหมวดหมู่
  const categoryMap = new Map<
    string,
    { name: string; color: string; icon: string; amount: number }
  >();

  for (const t of transactions) {
    if (t.type === "EXPENSE") {
      const d = new Date(t.date).getDate();
      dayMap.set(d, (dayMap.get(d) || 0) + t.amount);

      if (t.category) {
        const catId = t.category.id;
        const cur = categoryMap.get(catId) || {
          name: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
          amount: 0,
        };
        cur.amount += t.amount;
        categoryMap.set(catId, cur);
      }
    }
  }

  const dailyExpenses = Array.from(dayMap.entries()).map(([day, amount]) => ({
    day: String(day),
    amount,
  }));

  const categoryExpenses = Array.from(categoryMap.values())
    .map((item) => ({
      categoryName: item.name,
      color: item.color,
      icon: item.icon,
      amount: item.amount,
      percentage: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    transactionCount: transactions.length,
    dailyExpenses,
    categoryExpenses,
  };
}

export async function getYearlyReport(year: number) {
  const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        date: { gte: startOfYear, lte: endOfYear },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: startOfYear, lte: endOfYear },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const netBalance = totalIncome - totalExpense;

  const THAI_MONTHS_SHORT = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const monthByMonth = [];

  for (let m = 0; m < 12; m++) {
    const sDate = new Date(year, m, 1, 0, 0, 0, 0);
    const eDate = new Date(year, m + 1, 0, 23, 59, 59, 999);

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

    monthByMonth.push({
      month: THAI_MONTHS_SHORT[m],
      monthIndex: m + 1,
      income: incomeVal,
      expense: expenseVal,
      net: incomeVal - expenseVal,
    });
  }

  return {
    totalIncome,
    totalExpense,
    netBalance,
    monthByMonth,
  };
}
