"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounts";
import { reconcileAllAccounts } from "@/lib/actions/balance";
import { AccountData } from "@/lib/types";
import {
  Wallet,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Banknote,
} from "lucide-react";
import { AccountIcon } from "@/components/ui/AccountIcon";

interface AccountsClientProps {
  accounts: AccountData[];
}

export function AccountsClient({ accounts }: AccountsClientProps) {
  const router = useRouter();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<AccountData | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("BANK");
  const [initialBalance, setInitialBalance] = useState("0");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [message, setMessage] = useState("");

  const handleOpenAdd = () => {
    setEditingAcc(null);
    setName("");
    setType("BANK");
    setInitialBalance("0");
    setColor("#3b82f6");
    setModalOpen(true);
    setMessage("");
  };

  const handleOpenEdit = (acc: AccountData) => {
    setEditingAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(String(acc.initialBalance));
    setColor(acc.color || "#3b82f6");
    setModalOpen(true);
    setMessage("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingAcc) {
        await updateAccount(editingAcc.id, {
          name: name.trim(),
          type,
          initialBalance: parseFloat(initialBalance) || 0,
          color,
        });
      } else {
        await createAccount({
          name: name.trim(),
          type,
          initialBalance: parseFloat(initialBalance) || 0,
          color,
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
    if (!confirm("คุณต้องการลบ/ระงับบัญชีนี้หรือไม่?")) return;
    try {
      await deleteAccount(id);
      router.refresh();
    } catch {
      alert("ไม่สามารถลบบัญชีได้");
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      await reconcileAllAccounts();
      setMessage("ปรับปรุงยอดเงินทุกบัญชีเรียบร้อยแล้ว ข้อมูลตรง 100%");
      router.refresh();
      setTimeout(() => setMessage(""), 4000);
    } catch {
      alert("เกิดข้อผิดพลาดในการ Reconcile");
    } finally {
      setReconciling(false);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const colors = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#64748b", // Slate
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            บัญชีการเงิน (Accounts)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            ยอดเงินรวมทั้งหมด: <span className="font-bold text-emerald-600">{formatCurrency(totalBalance)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="ตรวจสอบและคำนวณยอดเงินใหม่จากประวัติธุรกรรมทั้งหมด"
          >
            <RefreshCw className={`h-4 w-4 ${reconciling ? "animate-spin" : ""}`} />
            Reconcile ยอดเงิน
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            เพิ่มบัญชีใหม่
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 relative overflow-hidden"
          >
            {/* Top color bar indicator */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: acc.color || "#3b82f6" }}
            />

            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs"
                    style={{ backgroundColor: acc.color || "#3b82f6" }}
                  >
                    <AccountIcon type={acc.type} size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {acc.name}
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      {acc.type === "CASH"
                        ? "เงินสด"
                        : acc.type === "BANK"
                        ? "ธนาคาร"
                        : acc.type === "WALLET"
                        ? "กระเป๋าเงินดิจิทัล"
                        : acc.type === "CREDIT_CARD"
                        ? "บัตรเครดิต"
                        : "การลงทุน"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                    title="แก้ไขบัญชี"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title="ลบบัญชี"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[11px] text-zinc-400">ยอดเงินปัจจุบัน</span>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(acc.currentBalance)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800">
              <span>ยอดเริ่มต้น: {formatCurrency(acc.initialBalance)}</span>
              <span>{acc._count?.transactions || 0} ธุรกรรม</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingAcc ? "แก้ไขบัญชี" : "เพิ่มบัญชีใหม่"}
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
                  ชื่อบัญชี *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น บัญชีเงินเดือน, เงินสด"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  ประเภทบัญชี *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="BANK">ธนาคาร (Bank)</option>
                  <option value="CASH">เงินสด (Cash)</option>
                  <option value="WALLET">E-Wallet (กระเป๋าเงินดิจิทัล)</option>
                  <option value="CREDIT_CARD">บัตรเครดิต (Credit Card)</option>
                  <option value="INVESTMENT">พอร์ตลงทุน (Investment)</option>
                  <option value="OTHER">อื่น ๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  ยอดเงินเริ่มต้น (บาท) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  สีประจำบัญชี
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full transition ${
                        color === c ? "ring-2 ring-emerald-500 ring-offset-2 scale-110" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
