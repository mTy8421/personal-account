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
  ArrowUpRight,
  ArrowLeftRight,
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ภาพรวมการเงิน (Dashboard)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            ข้อมูลบัญชีและรายการประจำเดือนปัจจุบัน
          </p>
        </div>

        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Receipt className="h-4 w-4" />
          ดูรายการทั้งหมด
        </Link>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              ยอดเงินทั้งหมด
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-foreground">
            {formatCurrency(stats.totalBalance)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            รวม {stats.accounts.length} บัญชีที่เปิดใช้งาน
          </p>
        </div>

        {/* Monthly Income */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              รายรับเดือนนี้
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-subtle text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-success-text dark:text-success">
            +{formatCurrency(stats.monthIncome)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            จากทั้งหมด {stats.monthTransactionCount} ธุรกรรม
          </p>
        </div>

        {/* Monthly Expense */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              รายจ่ายเดือนนี้
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-subtle text-danger">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-danger">
            -{formatCurrency(stats.monthExpense)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {stats.categoryExpenses.length} หมวดหมู่ที่มีการใช้จ่าย
          </p>
        </div>

        {/* Monthly Net Balance */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              คงเหลือเดือนนี้
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-subtle text-accent">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-black ${
              stats.monthNet >= 0
                ? "text-success-text dark:text-success"
                : "text-danger"
            }`}
          >
            {stats.monthNet >= 0 ? "+" : ""}
            {formatCurrency(stats.monthNet)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {stats.monthNet >= 0 ? "การออมเป็นบวก 👍" : "รายจ่ายมากกว่ารายรับ ⚠️"}
          </p>
        </div>
      </div>

      {/* Account Balances Summary Carousel/Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            บัญชีของฉัน
          </h2>
          <Link
            href="/accounts"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            จัดการบัญชี <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: acc.color || "#083D77" }}
                >
                  <AccountIcon type={acc.type} size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {acc.name}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
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
              <p className="text-sm font-black text-foreground">
                {formatCurrency(acc.currentBalance)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Category Donut & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                สัดส่วนรายจ่ายตามหมวดหมู่
              </h2>
              <p className="text-[11px] text-muted-foreground">ประจำเดือนปัจจุบัน</p>
            </div>
            <Link
              href="/budgets"
              className="text-xs font-semibold text-primary hover:underline"
            >
              ดูงบประมาณ
            </Link>
          </div>
          <div className="pt-4">
            <CategoryDonutChart data={stats.categoryExpenses} />
          </div>
        </div>

        {/* 6-Month Income vs Expense Trend */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                เปรียบเทียบรายรับ - รายจ่าย
              </h2>
              <p className="text-[11px] text-muted-foreground">ย้อนหลัง 6 เดือน</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-primary hover:underline"
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
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              รายการธุรกรรมล่าสุด
            </h2>
            <p className="text-[11px] text-muted-foreground">8 รายการล่าสุดในระบบ</p>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            ดูทั้งหมด <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              ยังไม่มีรายการธุรกรรมในระบบ
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {stats.recentTransactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const isTransfer = tx.type === "TRANSFER";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 hover:bg-muted/40 transition px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs ${
                        isTransfer
                          ? "bg-primary"
                          : isIncome
                          ? "bg-success"
                          : "bg-danger"
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
                        <span className="text-xs font-bold text-foreground">
                          {isTransfer
                            ? `โอนเงิน: ${tx.account?.name} → ${tx.toAccount?.name}`
                            : tx.note || tx.category?.name || "ไม่ระบุรายการ"}
                        </span>
                        {tx.category && !isTransfer && (
                          <span
                            className="hidden sm:inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${tx.category.color}20`,
                              color: tx.category.color,
                            }}
                          >
                            {tx.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
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
                          ? "text-primary dark:text-primary-foreground"
                          : isIncome
                          ? "text-success-text dark:text-success"
                          : "text-danger"
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
