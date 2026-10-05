"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";
import { formatThaiMonthYear } from "@/lib/utils/date";
import {
  ChevronLeft,
  ChevronRight,
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            รายงานและสถิติ (Reports)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            วิเคราะห์พฤติกรรมการเงิน สรุปผลรายเดือนและรายปี
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-muted p-1">
            <button
              onClick={() => switchMode("monthly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportMode === "monthly"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => switchMode("yearly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportMode === "yearly"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              รายปี
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
            <button
              onClick={handlePrev}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-foreground">
              {reportMode === "monthly"
                ? formatThaiMonthYear(month, year)
                : `ประจำปี ค.ศ. ${year}`}
            </span>
            <button
              onClick={handleNext}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
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
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                รายรับทั้งหมด
              </span>
              <p className="mt-2 text-2xl font-black text-success-text dark:text-success">
                +{formatCurrency(monthlyData.totalIncome)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                รายจ่ายทั้งหมด
              </span>
              <p className="mt-2 text-2xl font-black text-danger">
                -{formatCurrency(monthlyData.totalExpense)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                เงินคงเหลือสุทธิ
              </span>
              <p
                className={`mt-2 text-2xl font-black ${
                  monthlyData.netBalance >= 0
                    ? "text-success-text dark:text-success"
                    : "text-danger"
                }`}
              >
                {monthlyData.netBalance >= 0 ? "+" : ""}
                {formatCurrency(monthlyData.netBalance)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                อัตราการออม (Savings Rate)
              </span>
              <p className="mt-2 text-2xl font-black text-accent">
                {monthlyData.savingsRate}%
              </p>
            </div>
          </div>

          {/* Day-by-Day Expense Trend Chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-1">
              แนวโน้มรายจ่ายในแต่ละวันของเดือน
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              กราฟแสดงยอดรายจ่ายสะสมในแต่ละวัน
            </p>
            <DailyExpenseChart data={monthlyData.dailyExpenses} />
          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-1">
              สัดส่วนค่าใช้จ่ายตามหมวดหมู่
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
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
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">รายรับสะสมทั้งปี</span>
              <p className="mt-2 text-2xl font-black text-success-text dark:text-success">
                +{formatCurrency(yearlyData.totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">รายจ่ายสะสมทั้งปี</span>
              <p className="mt-2 text-2xl font-black text-danger">
                -{formatCurrency(yearlyData.totalExpense)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">เงินเก็บสุทธิทั้งปี</span>
              <p
                className={`mt-2 text-2xl font-black ${
                  yearlyData.netBalance >= 0 ? "text-success-text dark:text-success" : "text-danger"
                }`}
              >
                {yearlyData.netBalance >= 0 ? "+" : ""}
                {formatCurrency(yearlyData.netBalance)}
              </p>
            </div>
          </div>

          {/* 12-Month Bar Chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-1">
              เปรียบเทียบรายรับและรายจ่ายตลอด 12 เดือน
            </h2>
            <p className="text-xs text-muted-foreground mb-4">ประจำปี ค.ศ. {year}</p>
            <MonthlyTrendChart data={yearlyData.monthByMonth} />
          </div>

          {/* Annual Breakdown Table */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">
                ตารางสรุปรายรับ - รายจ่าย 12 เดือน
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-semibold">เดือน</th>
                    <th className="py-3 px-4 text-right font-semibold">รายรับ</th>
                    <th className="py-3 px-4 text-right font-semibold">รายจ่าย</th>
                    <th className="py-3 px-4 text-right font-semibold">คงเหลือสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {yearlyData.monthByMonth.map((m: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/40 transition"
                    >
                      <td className="py-3 px-4 font-bold text-foreground">
                        {m.month}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-success-text dark:text-success">
                        {m.income > 0 ? `+${formatCurrency(m.income)}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-danger">
                        {m.expense > 0 ? `-${formatCurrency(m.expense)}` : "-"}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          m.net >= 0 ? "text-success-text dark:text-success" : "text-danger"
                        }`}
                      >
                        {m.net !== 0 ? formatCurrency(m.net) : "฿0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/70 border-t-2 border-border font-bold">
                  <tr>
                    <td className="py-3 px-4 text-foreground font-bold">รวมทั้งปี ({year})</td>
                    <td className="py-3 px-4 text-right font-bold text-success-text dark:text-success">
                      +{formatCurrency(yearlyData.totalIncome)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-danger">
                      -{formatCurrency(yearlyData.totalExpense)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        yearlyData.netBalance >= 0 ? "text-success-text dark:text-success" : "text-danger"
                      }`}
                    >
                      {yearlyData.netBalance >= 0 ? "+" : ""}
                      {formatCurrency(yearlyData.netBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
