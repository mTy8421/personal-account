import React from "react";
import { getBudgets } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";
import { BudgetsClient } from "./BudgetsClient";

export const dynamic = "force-dynamic";

interface BudgetsPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month || String(now.getMonth() + 1), 10);
  const year = parseInt(params.year || String(now.getFullYear()), 10);

  const [budgets, categories] = await Promise.all([
    getBudgets(month, year),
    getCategories("EXPENSE"),
  ]);

  return (
    <BudgetsClient
      budgets={budgets as any}
      categories={categories as any}
      month={month}
      year={year}
    />
  );
}
