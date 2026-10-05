import React from "react";
import { getTransactions } from "@/lib/actions/transactions";
import { getAccounts } from "@/lib/actions/accounts";
import { getCategories } from "@/lib/actions/categories";
import { TransactionsClient } from "./TransactionsClient";

export const dynamic = "force-dynamic";

interface TransactionsPageProps {
  searchParams: Promise<{
    type?: string;
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);

  const [txData, accounts, categories] = await Promise.all([
    getTransactions({
      type: params.type,
      accountId: params.accountId,
      categoryId: params.categoryId,
      startDate: params.startDate,
      endDate: params.endDate,
      search: params.search,
      page,
      limit: 15,
    }),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <TransactionsClient
      initialTransactions={txData.transactions}
      totalCount={txData.totalCount}
      totalPages={txData.totalPages}
      currentPage={txData.currentPage}
      accounts={accounts as any}
      categories={categories as any}
    />
  );
}
