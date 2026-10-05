"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";
import { formatThaiMonthYear } from "@/lib/utils/date";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";
import { CategoryDonutChart } from "@/components/charts/CategoryDonutChart";
import { DailyExpenseChart } from "@/components/charts/DailyExpenseChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";

interface ReportsClientProps {
  mode: "monthly" | "yearly";
  month: number;
  year: number;
  monthlyData: any;
  yearlyData: any;
}

export function ReportsClient({
  mode,
  month,
  year,
  monthlyData,
  yearlyData,
}: ReportsClientProps) {
  const router = useRouter();
  const [reportMode, setReportMode] = useState<"monthly" | "yearly">(mode);

  const handlePrev = () => {
    if (reportMode === "monthly") {
      let newM = month - 1;
      let newY = year;
      if (newM < 1) {
        newM = 12;
        newY -= 1;
      }
      router.push(`/reports?mode=monthly&month=${newM}&year=${newY}`);
    } else {
      router.push(`/reports?mode=yearly&year=${year - 1}`);
    }
  };

  const handleNext = () => {
    if (reportMode === "monthly") {
      let newM = month + 1;
      let newY = year;
      if (newM > 12) {
        newM = 1;
        newY += 1;
      }
      router.push(`/reports?mode=monthly&month=${newM}&year=${newY}`);
    } else {
      router.push(`/reports?mode=yearly&year=${year + 1}`);
    }
  };

  const switchMode = (newMode: "monthly" | "yearly") => {
    setReportMode(newMode);
    router.push(`/reports?mode=${newMode}&month=${month}&year=${year}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            รายงานและสถิติ (Reports)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            วิเคราะห์พฤติกรรมการเงิน สรุปผลรายเดือนและรายปี
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              onClick={() => switchMode("monthly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportMode === "monthly"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => switchMode("yearly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportMode === "yearly"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              รายปี
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs">
            <button
              onClick={handlePrev}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {reportMode === "monthly"
                ? formatThaiMonthYear(month, year)
                : `ประจำปี ค.ศ. ${year}`}
            </span>
            <button
              onClick={handleNext}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {reportMode === "monthly" ? (
        /* Monthly Report Content */
        <div className="space-y-6">
          {/* Key Monthly Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                รายรับทั้งหมด
              </span>
              <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(monthlyData.totalIncome)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                รายจ่ายทั้งหมด
              </span>
              <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
                -{formatCurrency(monthlyData.totalExpense)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                เงินคงเหลือสุทธิ
              </span>
              <p
                className={`mt-2 text-2xl font-black ${
                  monthlyData.netBalance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {monthlyData.netBalance >= 0 ? "+" : ""}
                {formatCurrency(monthlyData.netBalance)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                อัตราการออม (Savings Rate)
              </span>
              <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
                {monthlyData.savingsRate}%
              </p>
            </div>
          </div>

          {/* Day-by-Day Expense Trend Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              แนวโน้มรายจ่ายในแต่ละวันของเดือน
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              กราฟแสดงยอดรายจ่ายสะสมในแต่ละวัน
            </p>
            <DailyExpenseChart data={monthlyData.dailyExpenses} />
          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              สัดส่วนค่าใช้จ่ายตามหมวดหมู่
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              รายละเอียดค่าใช้จ่ายในแต่ละหมวดหมู่
            </p>
            <CategoryDonutChart data={monthlyData.categoryExpenses} />
          </div>
        </div>
      ) : (
        /* Yearly Report Content */
        <div className="space-y-6">
          {/* Yearly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500">รายรับสะสมทั้งปี</span>
              <p className="mt-2 text-2xl font-black text-emerald-600">
                +{formatCurrency(yearlyData.totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500">รายจ่ายสะสมทั้งปี</span>
              <p className="mt-2 text-2xl font-black text-rose-600">
                -{formatCurrency(yearlyData.totalExpense)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500">เงินเก็บสุทธิทั้งปี</span>
              <p
                className={`mt-2 text-2xl font-black ${
                  yearlyData.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {yearlyData.netBalance >= 0 ? "+" : ""}
                {formatCurrency(yearlyData.netBalance)}
              </p>
            </div>
          </div>

          {/* 12-Month Bar Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              เปรียบเทียบรายรับและรายจ่ายตลอด 12 เดือน
            </h2>
            <p className="text-xs text-zinc-400 mb-4">ประจำปี ค.ศ. {year}</p>
            <MonthlyTrendChart data={yearlyData.monthByMonth} />
          </div>

          {/* Annual Breakdown Table */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ตารางสรุปรายรับ - รายจ่าย 12 เดือน
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 dark:bg-zinc-800/60 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">เดือน</th>
                    <th className="py-3 px-4 text-right font-semibold">รายรับ</th>
                    <th className="py-3 px-4 text-right font-semibold">รายจ่าย</th>
                    <th className="py-3 px-4 text-right font-semibold">คงเหลือสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {yearlyData.monthByMonth.map((m: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                    >
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {m.month}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                        {m.income > 0 ? `+${formatCurrency(m.income)}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-600">
                        {m.expense > 0 ? `-${formatCurrency(m.expense)}` : "-"}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          m.net >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {m.net !== 0 ? formatCurrency(m.net) : "฿0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
