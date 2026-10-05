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
import { ModalWrapper } from "@/components/ui/ModalWrapper";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(""), 5000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(""), 4000);
    }
  };

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
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!categoryId || isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    setError("");
    try {
      await setBudget({
        categoryId,
        amount: numAmount,
        month,
        year,
      });
      setModalOpen(false);
      showFeedback("บันทึกงบประมาณเรียบร้อยแล้ว");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการตั้งงบประมาณ");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteBudget(deleteId);
      setDeleteId(null);
      showFeedback("ลบงบประมาณเรียบร้อยแล้ว");
      router.refresh();
    } catch {
      showFeedback("ไม่สามารถลบได้", true);
    } finally {
      setDeleting(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            งบประมาณรายเดือน (Budgets)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            กำหนดและควบคุมเพดานค่าใช้จ่ายในแต่ละหมวดหมู่
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-foreground">
              {formatThaiMonthYear(month, year)}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            ตั้งงบประมาณ
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-success-subtle p-3 text-xs font-semibold text-success-text border border-success/30">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-subtle p-3 text-xs font-semibold text-danger-text border border-danger/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Overview Progress Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              ภาพรวมงบประมาณประจำ {formatThaiMonthYear(month, year)}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                / {formatCurrency(totalBudget)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-medium text-muted-foreground">งบประมาณคงเหลือรวม</span>
            <p
              className={`text-lg font-bold ${
                totalRemaining >= 0
                  ? "text-success-text dark:text-success"
                  : "text-danger"
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
          <div className="flex justify-between text-xs mb-1.5 font-semibold text-muted-foreground">
            <span>ใช้ไปแล้ว {overallPercentage}%</span>
            <span>{totalRemaining >= 0 ? `เหลืออีก ${100 - overallPercentage}%` : "เกินงบประมาณ!"}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? "bg-danger"
                  : overallPercentage >= 80
                  ? "bg-warning"
                  : "bg-success"
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Items Grid */}
      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
          <PiggyBank className="mx-auto mb-3 h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-sm font-bold text-foreground">
            ยังไม่ได้กำหนดงบประมาณสำหรับเดือนนี้
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            คลิกปุ่ม &quot;ตั้งงบประมาณ&quot; เพื่อเริ่มต้นกำหนดเป้าหมายการใช้จ่าย
          </p>
          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary"
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
                className="rounded-2xl border border-border bg-card p-5 shadow-xs relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: b.category?.color || "#083D77" }}
                    >
                      <CategoryIcon name={b.category?.icon || "Tag"} size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {b.category?.name}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        งบประมาณ: {formatCurrency(b.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenAdd(b)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      title="แก้ไขงบ"
                      aria-label="แก้ไขงบ"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(b.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger-subtle hover:text-danger transition"
                      title="ลบงบ"
                      aria-label="ลบงบ"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Alert Banner */}
                {isOver ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-danger-subtle p-2.5 text-xs font-semibold text-danger-text border border-danger/30">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>⚠️ ค่า{b.category?.name}เกินงบประมาณแล้ว (+{formatCurrency(spent - b.amount)})</span>
                  </div>
                ) : isNear ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-warning-subtle p-2.5 text-xs font-semibold text-warning-text border border-warning/40">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>ใกล้ถึงเพดานงบประมาณแล้ว (ใช้ไปแล้ว {pct}%)</span>
                  </div>
                ) : null}

                {/* Progress Detail */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">
                      ใช้ไปแล้ว: {formatCurrency(spent)}
                    </span>
                    <span
                      className={`font-semibold ${
                        remaining >= 0
                          ? "text-success-text dark:text-success"
                          : "text-danger"
                      }`}
                    >
                      {remaining >= 0 ? `เหลือ: ${formatCurrency(remaining)}` : "เกินงบ"}
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-danger"
                          : isNear
                          ? "bg-warning"
                          : "bg-success"
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

      {/* Set Budget Modal with Focus Trap & Escape */}
      <ModalWrapper
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        ariaLabel={`ตั้งงบประมาณ (${formatThaiMonthYear(month, year)})`}
      >
        <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl border border-border">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">
              ตั้งงบประมาณ ({formatThaiMonthYear(month, year)})
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-xl bg-danger-subtle p-2.5 text-xs font-semibold text-danger-text border border-danger/30">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                หมวดหมู่ค่าใช้จ่าย *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground">
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
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกงบ"}
              </button>
            </div>
          </form>
        </div>
      </ModalWrapper>

      {/* Accessible Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="ยืนยันการลบงบประมาณ?"
        message="การลบงบประมาณนี้จะไม่ส่งผลต่อประวัติธุรกรรมที่เคยบันทึกไว้"
        confirmLabel="ลบงบประมาณ"
        variant="danger"
      />
    </div>
  );
}
