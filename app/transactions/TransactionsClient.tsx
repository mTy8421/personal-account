"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils/currency";
import { formatThaiDate } from "@/lib/utils/date";
import { deleteTransaction } from "@/lib/actions/transactions";
import { AccountData, CategoryData, TransactionData } from "@/lib/types";
import {
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface TransactionsClientProps {
  initialTransactions: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  accounts: AccountData[];
  categories: CategoryData[];
}

export function TransactionsClient({
  initialTransactions,
  totalCount,
  totalPages,
  currentPage,
  accounts,
  categories,
}: TransactionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters state from URL query
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [accountId, setAccountId] = useState(searchParams.get("accountId") || "ALL");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "ALL");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = {
      search,
      type,
      accountId,
      categoryId,
      startDate,
      endDate,
      ...updates,
      page: "1", // reset page
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "ALL") {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });

    router.push(`/transactions?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTransaction(deleteId);
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      alert("ไม่สามารถลบรายการได้");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            รายการธุรกรรม (Transactions)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            พบทั้งหมด {totalCount} รายการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/backup/export?format=csv"
            download
            className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <button
            onClick={() => {
              setEditingTx(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            เพิ่มรายการใหม่
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="ค้นหาตามบันทึกย่อ, หมวดหมู่, บัญชี..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            ค้นหา
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          {/* ประเภท */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400">ประเภท</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                applyFilters({ type: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-zinc-200 p-2 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="EXPENSE">รายจ่าย</option>
              <option value="INCOME">รายรับ</option>
              <option value="TRANSFER">โอนเงิน</option>
            </select>
          </div>

          {/* บัญชี */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400">บัญชี</label>
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                applyFilters({ accountId: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-zinc-200 p-2 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="ALL">ทุกบัญชี</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400">หมวดหมู่</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                applyFilters({ categoryId: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-zinc-200 p-2 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === "INCOME" ? "รายรับ" : "รายจ่าย"})
                </option>
              ))}
            </select>
          </div>

          {/* วันที่เริ่มต้น */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                applyFilters({ startDate: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-zinc-200 p-1.5 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table / List */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {initialTransactions.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <p className="text-sm">ไม่พบรายการธุรกรรมตามเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 dark:bg-zinc-800/60 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">วันที่</th>
                    <th className="py-3 px-4 font-semibold">รายการ</th>
                    <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                    <th className="py-3 px-4 font-semibold">บัญชี</th>
                    <th className="py-3 px-4 text-right font-semibold">จำนวนเงิน</th>
                    <th className="py-3 px-4 text-center font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {initialTransactions.map((tx) => {
                    const isIncome = tx.type === "INCOME";
                    const isTransfer = tx.type === "TRANSFER";

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                      >
                        <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                          {formatThaiDate(tx.date)}
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {isTransfer
                            ? `โอนเงิน: ${tx.account?.name} → ${tx.toAccount?.name}`
                            : tx.note || tx.category?.name || "ไม่ระบุ"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.category ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${tx.category.color}20`,
                                color: tx.category.color,
                              }}
                            >
                              <CategoryIcon name={tx.category.icon} size={14} />
                              {tx.category.name}
                            </span>
                          ) : isTransfer ? (
                            <span className="text-zinc-400">โอนเงิน</span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                          {tx.account?.name}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                            isTransfer
                              ? "text-blue-600 dark:text-blue-400"
                              : isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isTransfer ? "" : isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTx(tx);
                                setDialogOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                              title="แก้ไขรายการ"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(tx.id)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                              title="ลบรายการ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  หน้า {currentPage} จากทั้งหมด {totalPages} หน้า
                </span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit / Add Modal */}
      <TransactionDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTx(null);
        }}
        editData={editingTx}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ยืนยันการลบรายการ?
            </h3>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              ยอดเงินในบัญชีที่เกี่ยวข้องจะถูกปรับปรุงย้อนกลับโดยอัตโนมัติ
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "กำลังลบ..." : "ลบรายการ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
