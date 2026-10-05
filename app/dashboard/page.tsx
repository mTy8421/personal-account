import React from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/transactions";
import { formatCurrency } from "@/lib/utils/currency";
import { formatThaiDate } from "@/lib/utils/date";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  PlusCircle,
} from "lucide-react";
import { CategoryDonutChart } from "@/components/charts/CategoryDonutChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { AccountIcon } from "@/components/ui/AccountIcon";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Title & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ภาพรวมการเงิน (Dashboard)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            ข้อมูลบัญชีและรายการประจำเดือนปัจจุบัน
          </p>
        </div>

        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Receipt className="h-4 w-4" />
          ดูรายการทั้งหมด
        </Link>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ยอดเงินทั้งหมด
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {formatCurrency(stats.totalBalance)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            รวม {stats.accounts.length} บัญชีที่เปิดใช้งาน
          </p>
        </div>

        {/* Monthly Income */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              รายรับเดือนนี้
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(stats.monthIncome)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            จากทั้งหมด {stats.monthTransactionCount} ธุรกรรม
          </p>
        </div>

        {/* Monthly Expense */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              รายจ่ายเดือนนี้
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400">
            -{formatCurrency(stats.monthExpense)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {stats.categoryExpenses.length} หมวดหมู่ที่มีการใช้จ่าย
          </p>
        </div>

        {/* Monthly Net Balance */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              คงเหลือเดือนนี้
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-black ${
              stats.monthNet >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {stats.monthNet >= 0 ? "+" : ""}
            {formatCurrency(stats.monthNet)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {stats.monthNet >= 0 ? "การออมเป็นบวก 👍" : "รายจ่ายมากกว่ารายรับ ⚠️"}
          </p>
        </div>
      </div>

      {/* Account Balances Summary Carousel/Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            บัญชีของฉัน
          </h2>
          <Link
            href="/accounts"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            จัดการบัญชี <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: acc.color || "#3b82f6" }}
                >
                  <AccountIcon type={acc.type} size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {acc.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {acc.type === "CASH"
                      ? "เงินสด"
                      : acc.type === "BANK"
                      ? "ธนาคาร"
                      : acc.type === "WALLET"
                      ? "Wallet"
                      : "บัตรเครดิต"}
                  </span>
                </div>
              </div>
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {formatCurrency(acc.currentBalance)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Category Donut & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                สัดส่วนรายจ่ายตามหมวดหมู่
              </h2>
              <p className="text-[11px] text-zinc-400">ประจำเดือนปัจจุบัน</p>
            </div>
            <Link
              href="/budgets"
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              ดูงบประมาณ
            </Link>
          </div>
          <div className="pt-4">
            <CategoryDonutChart data={stats.categoryExpenses} />
          </div>
        </div>

        {/* 6-Month Income vs Expense Trend */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                เปรียบเทียบรายรับ - รายจ่าย
              </h2>
              <p className="text-[11px] text-zinc-400">ย้อนหลัง 6 เดือน</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              ดูรายงานเต็ม
            </Link>
          </div>
          <div className="pt-4">
            <MonthlyTrendChart data={stats.monthlyTrend} />
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              รายการธุรกรรมล่าสุด
            </h2>
            <p className="text-[11px] text-zinc-400">8 รายการล่าสุดในระบบ</p>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            ดูทั้งหมด <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ยังไม่มีรายการธุรกรรมในระบบ
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {stats.recentTransactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const isTransfer = tx.type === "TRANSFER";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                        isTransfer
                          ? "bg-blue-500"
                          : isIncome
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    >
                      {isTransfer ? (
                        <ArrowLeftRight className="h-5 w-5" />
                      ) : isIncome ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <CategoryIcon
                          name={tx.category?.icon || "Utensils"}
                          className="h-5 w-5 text-white"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {isTransfer
                            ? `โอนเงิน: ${tx.account?.name} → ${tx.toAccount?.name}`
                            : tx.note || tx.category?.name || "ไม่ระบุรายการ"}
                        </span>
                        {tx.category && !isTransfer && (
                          <span
                            className="hidden sm:inline-block rounded-md px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: `${tx.category.color}20`,
                              color: tx.category.color,
                            }}
                          >
                            {tx.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                        <span>{formatThaiDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.account?.name}</span>
                        {tx.note && !isTransfer && tx.note !== tx.category?.name && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isTransfer
                          ? "text-blue-600 dark:text-blue-400"
                          : isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isTransfer
                        ? ""
                        : isIncome
                        ? "+"
                        : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
