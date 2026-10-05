"use client";

import React, { useState, useEffect } from "react";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import { getAccounts } from "@/lib/actions/accounts";
import { getCategories } from "@/lib/actions/categories";
import { AccountData, CategoryData, TransactionData } from "@/lib/types";
import { toInputDateFormat } from "@/lib/utils/date";
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: TransactionData | null;
}

export function TransactionDialog({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: TransactionDialogProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [date, setDate] = useState<string>(toInputDateFormat());
  const [note, setNote] = useState<string>("");

  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // โหลดรายการบัญชีและหมวดหมู่
  useEffect(() => {
    async function loadOptions() {
      try {
        const [accList, catList] = await Promise.all([
          getAccounts(),
          getCategories(),
        ]);
        setAccounts(accList as any);
        setCategories(catList as any);

        if (accList.length > 0 && !accountId) {
          setAccountId(accList[0].id);
        }
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, accountId]);

  // ตั้งค่าเริ่มต้นเมื่อเปิด Modal ในโหมดแก้ไข (Edit)
  useEffect(() => {
    if (editData) {
      setType(editData.type as any);
      setAmount(String(editData.amount));
      setAccountId(editData.accountId);
      setToAccountId(editData.toAccountId || "");
      setCategoryId(editData.categoryId || "");
      setDate(toInputDateFormat(editData.date));
      setNote(editData.note || "");
    } else {
      setType("EXPENSE");
      setAmount("");
      setToAccountId("");
      setCategoryId("");
      setDate(toInputDateFormat());
      setNote("");
    }
    setError("");
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // กรองหมวดหมู่ตามประเภท (EXPENSE / INCOME)
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("กรุณาระบุจำนวนเงินที่มากกว่า 0");
      return;
    }

    if (!accountId) {
      setError("กรุณาเลือกบัญชี");
      return;
    }

    if (type === "TRANSFER") {
      if (!toAccountId) {
        setError("กรุณาเลือกบัญชีปลายทาง");
        return;
      }
      if (accountId === toAccountId) {
        setError("บัญชีต้นทางและปลายทางต้องไม่เป็นบัญชีเดียวกัน");
        return;
      }
    } else if (!categoryId) {
      setError("กรุณาเลือกหมวดหมู่");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (editData) {
        await updateTransaction(editData.id, {
          type,
          amount: numAmount,
          accountId,
          toAccountId: type === "TRANSFER" ? toAccountId : null,
          categoryId: type !== "TRANSFER" ? categoryId : null,
          date: new Date(date),
          note,
        });
      } else {
        await createTransaction({
          type,
          amount: numAmount,
          accountId,
          toAccountId: type === "TRANSFER" ? toAccountId : null,
          categoryId: type !== "TRANSFER" ? categoryId : null,
          date: new Date(date),
          note,
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-8">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {editData ? "แก้ไขรายการธุรกรรม" : "เพิ่มรายการใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ปุ่มสลับประเภท รายจ่าย / รายรับ / โอนเงิน */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => {
              setType("EXPENSE");
              setCategoryId("");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
              type === "EXPENSE"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            รายจ่าย
          </button>
          <button
            type="button"
            onClick={() => {
              setType("INCOME");
              setCategoryId("");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
              type === "INCOME"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            รายรับ
          </button>
          <button
            type="button"
            onClick={() => {
              setType("TRANSFER");
              setCategoryId("");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
              type === "TRANSFER"
                ? "bg-blue-500 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            โอนเงิน
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* จำนวนเงิน */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg font-bold text-zinc-400">
                ฿
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 py-3 pl-9 pr-4 text-xl font-bold text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* บัญชี */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {type === "TRANSFER" ? "จากบัญชี *" : "บัญชี *"}
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (฿{acc.currentBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {type === "TRANSFER" && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  ไปยังบัญชี *
                </label>
                <select
                  required
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">-- เลือกบัญชีปลายทาง --</option>
                  {accounts
                    .filter((acc) => acc.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (฿{acc.currentBalance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* หมวดหมู่ (เฉพาะ Income/Expense) */}
          {type !== "TRANSFER" && (
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                หมวดหมู่ *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* วันที่ & หมายเหตุ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                วันที่ *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                หมายเหตุ / บันทึกย่อ
              </label>
              <input
                type="text"
                placeholder="เช่น ข้าวเที่ยง, ชานม"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : editData ? "บันทึกการแก้ไข" : "บันทึกรายการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
