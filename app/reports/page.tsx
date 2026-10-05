import React from "react";
import { getMonthlyReport, getYearlyReport } from "@/lib/actions/reports";
import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

interface ReportsPageProps {
  searchParams: Promise<{
    mode?: "monthly" | "yearly";
    month?: string;
    year?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const now = new Date();
  const mode = params.mode === "yearly" ? "yearly" : "monthly";
  const month = parseInt(params.month || String(now.getMonth() + 1), 10);
  const year = parseInt(params.year || String(now.getFullYear()), 10);

  const [monthlyData, yearlyData] = await Promise.all([
    getMonthlyReport(month, year),
    getYearlyReport(year),
  ]);

  return (
    <ReportsClient
      mode={mode}
      month={month}
      year={year}
      monthlyData={monthlyData}
      yearlyData={yearlyData}
    />
  );
}
