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
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground">
            {editData ? "แก้ไขรายการธุรกรรม" : "เพิ่มรายการใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ปุ่มสลับประเภท รายจ่าย / รายรับ / โอนเงิน */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setType("EXPENSE");
              setCategoryId("");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
              type === "EXPENSE"
                ? "bg-danger text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
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
                ? "bg-success text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
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
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            โอนเงิน
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-danger-subtle p-3 text-sm text-danger-text border border-danger/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* จำนวนเงิน */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg font-bold text-muted-foreground">
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
                className="w-full rounded-xl border border-border bg-card py-3 pl-9 pr-4 text-xl font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          {/* บัญชี */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                {type === "TRANSFER" ? "จากบัญชี *" : "บัญชี *"}
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
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
                <label className="block text-xs font-medium text-muted-foreground">
                  ไปยังบัญชี *
                </label>
                <select
                  required
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
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
              <label className="block text-xs font-medium text-muted-foreground">
                หมวดหมู่ *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
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
              <label className="block text-xs font-medium text-muted-foreground">
                วันที่ *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                หมายเหตุ / บันทึกย่อ
              </label>
              <input
                type="text"
                placeholder="เช่น ข้าวเที่ยง, ชานม"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover disabled:opacity-50 transition focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {loading ? "กำลังบันทึก..." : editData ? "บันทึกการแก้ไข" : "บันทึกรายการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
