import React from "react";
import { getRecurringExpenses } from "@/lib/actions/recurring";
import { getCategories } from "@/lib/actions/categories";
import { getAccounts } from "@/lib/actions/accounts";
import { RecurringClient } from "./RecurringClient";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const [recurringExpenses, categories, accounts] = await Promise.all([
    getRecurringExpenses(),
    getCategories("EXPENSE"),
    getAccounts(),
  ]);

  return (
    <RecurringClient
      recurringExpenses={recurringExpenses as any}
      categories={categories as any}
      accounts={accounts as any}
    />
  );
}
