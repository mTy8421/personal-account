"use server";

import prisma from "@/lib/prisma";
import { getMonthDateRange } from "@/lib/utils/date";
import { safeRevalidatePath } from "@/lib/utils/revalidate";

export async function getBudgets(month: number, year: number) {
  const { start, end } = getMonthDateRange(year, month);

  const budgets = await prisma.budget.findMany({
    where: {
      month,
      year,
    },
    include: {
      category: true,
    },
    orderBy: {
      amount: "desc",
    },
  });

  // คำนวณรายจ่ายจริงที่เกิดขึ้นในหมวดหมู่นั้นๆ ในเดือนดังกล่าว
  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const agg = await prisma.transaction.aggregate({
        where: {
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const spent = agg._sum.amount || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return {
        ...budget,
        spent,
        remaining,
        percentage,
      };
    })
  );

  return budgetsWithSpent;
}

export async function setBudget(data: {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}) {
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("งบประมาณต้องมากกว่า 0");
  }

  const result = await prisma.budget.upsert({
    where: {
      categoryId_month_year: {
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      amount,
    },
    create: {
      categoryId: data.categoryId,
      amount,
      month: data.month,
      year: data.year,
    },
  });

  safeRevalidatePath("/budgets");
  safeRevalidatePath("/dashboard");
  return result;
}

export async function deleteBudget(id: string) {
  await prisma.budget.delete({
    where: { id },
  });

  safeRevalidatePath("/budgets");
  return { success: true };
}
