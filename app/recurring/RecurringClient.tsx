"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";
import { formatThaiDate, toInputDateFormat } from "@/lib/utils/date";
import {
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpense,
} from "@/lib/actions/recurring";
import { RecurringExpenseData, CategoryData, AccountData } from "@/lib/types";
import {
  CalendarClock,
  Plus,
  Play,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface RecurringClientProps {
  recurringExpenses: RecurringExpenseData[];
  categories: CategoryData[];
  accounts: AccountData[];
}

export function RecurringClient({
  recurringExpenses,
  categories,
  accounts,
}: RecurringClientProps) {
  const router = useRouter();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringExpenseData | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [nextDueDate, setNextDueDate] = useState(toInputDateFormat());
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleOpenAdd = (item?: RecurringExpenseData) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setAmount(String(item.amount));
      setCategoryId(item.categoryId);
      setAccountId(item.accountId);
      setFrequency(item.frequency);
      setDayOfMonth(String(item.dayOfMonth || 1));
      setNextDueDate(toInputDateFormat(item.nextDueDate));
    } else {
      setEditingItem(null);
      setName("");
      setAmount("");
      setCategoryId(categories[0]?.id || "");
      setAccountId(accounts[0]?.id || "");
      setFrequency("MONTHLY");
      setDayOfMonth("1");
      setNextDueDate(toInputDateFormat());
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!name.trim() || isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    try {
      if (editingItem) {
        await updateRecurringExpense(editingItem.id, {
          name: name.trim(),
          amount: numAmount,
          categoryId,
          accountId,
          frequency,
          dayOfMonth: parseInt(dayOfMonth, 10),
          nextDueDate: new Date(nextDueDate),
        });
      } else {
        await createRecurringExpense({
          name: name.trim(),
          amount: numAmount,
          categoryId,
          accountId,
          frequency: frequency as any,
          dayOfMonth: parseInt(dayOfMonth, 10),
          nextDueDate: new Date(nextDueDate),
        });
      }
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบรายการประจำนี้หรือไม่?")) return;
    try {
      await deleteRecurringExpense(id);
      router.refresh();
    } catch {
      alert("ไม่สามารถลบได้");
    }
  };

  const handleProcess = async (id: string) => {
    setProcessingId(id);
    try {
      await processRecurringExpense(id);
      setMessage("บันทึกธุรกรรมและเลื่อนวันครบกำหนดเรียบร้อยแล้ว!");
      router.refresh();
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "ไม่สามารถบันทึกรายการได้");
    } finally {
      setProcessingId(null);
    }
  };

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ค่าใช้จ่ายประจำ (Recurring Expenses)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            จัดการบิลและรายการที่ต้องชำระซ้ำ เช่น ค่าห้อง, บิลค่าไฟ, Netflix
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการประจำ
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-success-subtle p-3 text-xs font-semibold text-success-text border border-success/30">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Recurring Cards */}
      {recurringExpenses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
          <CalendarClock className="mx-auto mb-3 h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-sm font-bold text-foreground">
            ยังไม่มีรายการค่าใช้จ่ายประจำ
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            เพิ่มบิลหรือค่าบริการรายเดือน เพื่อให้ระบบเตือนและบันทึกรายการได้ในคลิกเดียว
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            <Plus className="h-4 w-4" />
            เพิ่มรายการแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurringExpenses.map((item) => {
            const dueDate = new Date(item.nextDueDate);
            const isDue = dueDate <= now;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs"
                        style={{ backgroundColor: item.category?.color || "#083D77" }}
                      >
                        <CategoryIcon name={item.category?.icon || "Tag"} size={22} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <span>{item.category?.name}</span>
                          <span>•</span>
                          <span>ตัดผ่าน: {item.account?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAdd(item)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                        title="แก้ไข"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-subtle hover:text-danger transition"
                        title="ลบ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-muted-foreground">จำนวนเงิน</span>
                      <p className="text-xl font-black text-danger">
                        -{formatCurrency(item.amount)}
                      </p>
                    </div>

                    <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground">
                      {item.frequency === "MONTHLY"
                        ? `ทุกวันที่ ${item.dayOfMonth || 1} ของเดือน`
                        : item.frequency === "DAILY"
                        ? "ทุกวัน"
                        : item.frequency === "WEEKLY"
                        ? "ทุกสัปดาห์"
                        : "ทุกปี"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">ครบกำหนด:</span>
                    <span
                      className={`font-semibold ${
                        isDue ? "text-danger animate-pulse" : "text-foreground"
                      }`}
                    >
                      {formatThaiDate(item.nextDueDate)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleProcess(item.id)}
                    disabled={processingId === item.id}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {processingId === item.id ? "กำลังบันทึก..." : "บันทึกรายการนี้ทันที"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                {editingItem ? "แก้ไขรายการประจำ" : "เพิ่มรายการค่าใช้จ่ายประจำ"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  ชื่อรายการประจำ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ค่าเช่าห้อง, ค่าอินเทอร์เน็ต, Netflix"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  จำนวนเงิน (บาท) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    หมวดหมู่ *
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
                    ตัดจากบัญชี *
                  </label>
                  <select
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    ความถี่ *
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="MONTHLY">รายเดือน (Monthly)</option>
                    <option value="DAILY">รายวัน (Daily)</option>
                    <option value="WEEKLY">รายสัปดาห์ (Weekly)</option>
                    <option value="YEARLY">รายปี (Yearly)</option>
                  </select>
                </div>

                {frequency === "MONTHLY" && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">
                      ทุกวันที่ (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  วันครบกำหนดถัดไป *
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
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
                  {loading ? "กำลังบันทึก..." : "บันทึกรายการ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
