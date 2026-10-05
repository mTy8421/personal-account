"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";
import { formatThaiMonthYear } from "@/lib/utils/date";
import { setBudget, deleteBudget } from "@/lib/actions/budgets";
import { BudgetData, CategoryData } from "@/lib/types";
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface BudgetsClientProps {
  budgets: BudgetData[];
  categories: CategoryData[];
  month: number;
  year: number;
}

export function BudgetsClient({
  budgets,
  categories,
  month,
  year,
}: BudgetsClientProps) {
  const router = useRouter();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    let newM = month - 1;
    let newY = year;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    router.push(`/budgets?month=${newM}&year=${newY}`);
  };

  const handleNextMonth = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    router.push(`/budgets?month=${newM}&year=${newY}`);
  };

  const handleOpenAdd = (b?: BudgetData) => {
    if (b) {
      setCategoryId(b.categoryId);
      setAmount(String(b.amount));
    } else {
      setCategoryId(categories[0]?.id || "");
      setAmount("");
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!categoryId || isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    try {
      await setBudget({
        categoryId,
        amount: numAmount,
        month,
        year,
      });
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการตั้งงบประมาณ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบงบประมาณนี้หรือไม่?")) return;
    try {
      await deleteBudget(id);
      router.refresh();
    } catch {
      alert("ไม่สามารถลบได้");
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            งบประมาณรายเดือน (Budgets)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            กำหนดและควบคุมเพดานค่าใช้จ่ายในแต่ละหมวดหมู่
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {formatThaiMonthYear(month, year)}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            ตั้งงบประมาณ
          </button>
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-zinc-400">
              ภาพรวมงบประมาณประจำ {formatThaiMonthYear(month, year)}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-sm font-semibold text-zinc-400">
                / {formatCurrency(totalBudget)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-medium text-zinc-400">งบประมาณคงเหลือรวม</span>
            <p
              className={`text-lg font-bold ${
                totalRemaining >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {totalRemaining >= 0
                ? formatCurrency(totalRemaining)
                : `เกินงบ ${formatCurrency(Math.abs(totalRemaining))}`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5 font-semibold text-zinc-500">
            <span>ใช้ไปแล้ว {overallPercentage}%</span>
            <span>{totalRemaining >= 0 ? `เหลืออีก ${100 - overallPercentage}%` : "เกินงบประมาณ!"}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? "bg-rose-500"
                  : overallPercentage >= 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Items Grid */}
      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <PiggyBank className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            ยังไม่ได้กำหนดงบประมาณสำหรับเดือนนี้
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            คลิกปุ่ม &quot;ตั้งงบประมาณ&quot; เพื่อเริ่มต้นกำหนดเป้าหมายการใช้จ่าย
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            ตั้งงบประมาณแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const remaining = b.amount - spent;
            const pct = b.percentage || 0;
            const isOver = spent > b.amount;
            const isNear = pct >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: b.category?.color || "#3b82f6" }}
                    >
                      <CategoryIcon name={b.category?.icon || "Tag"} size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {b.category?.name}
                      </h3>
                      <span className="text-[11px] text-zinc-400">
                        งบประมาณ: {formatCurrency(b.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAdd(b)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                      title="แก้ไขงบ"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      title="ลบงบ"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Alert Banner */}
                {isOver ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>⚠️ ค่า{b.category?.name}เกินงบประมาณแล้ว (+{formatCurrency(spent - b.amount)})</span>
                  </div>
                ) : isNear ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>ใกล้ถึงเพดานงบประมาณแล้ว (ใช้ไปแล้ว {pct}%)</span>
                  </div>
                ) : null}

                {/* Progress Detail */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      ใช้ไปแล้ว: {formatCurrency(spent)}
                    </span>
                    <span
                      className={`font-semibold ${
                        remaining >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {remaining >= 0 ? `เหลือ: ${formatCurrency(remaining)}` : "เกินงบ"}
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-rose-500"
                          : isNear
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ตั้งงบประมาณ ({formatThaiMonthYear(month, year)})
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  หมวดหมู่ค่าใช้จ่าย *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  จำนวนงบประมาณ (บาท) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="เช่น 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกงบ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
