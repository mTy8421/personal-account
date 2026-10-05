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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            รายการธุรกรรม (Transactions)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            พบทั้งหมด {totalCount} รายการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/backup/export?format=csv"
            download
            className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <button
            onClick={() => {
              setEditingTx(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            เพิ่มรายการใหม่
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาตามบันทึกย่อ, หมวดหมู่, บัญชี..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/40 py-2 pl-9 pr-4 text-xs font-medium text-foreground focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            ค้นหา
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border text-xs">
          {/* ประเภท */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">ประเภท</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                applyFilters({ type: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-border bg-card p-2 font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="EXPENSE">รายจ่าย</option>
              <option value="INCOME">รายรับ</option>
              <option value="TRANSFER">โอนเงิน</option>
            </select>
          </div>

          {/* บัญชี */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">บัญชี</label>
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                applyFilters({ accountId: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-border bg-card p-2 font-medium text-foreground focus:border-primary focus:outline-hidden"
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
            <label className="text-[11px] font-medium text-muted-foreground">หมวดหมู่</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                applyFilters({ categoryId: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-border bg-card p-2 font-medium text-foreground focus:border-primary focus:outline-hidden"
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
            <label className="text-[11px] font-medium text-muted-foreground">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                applyFilters({ startDate: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-border bg-card p-1.5 font-medium text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table / List */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {initialTransactions.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-sm">ไม่พบรายการธุรกรรมตามเงื่อนไขที่เลือก</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-semibold">วันที่</th>
                    <th className="py-3 px-4 font-semibold">รายการ</th>
                    <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                    <th className="py-3 px-4 font-semibold">บัญชี</th>
                    <th className="py-3 px-4 text-right font-semibold">จำนวนเงิน</th>
                    <th className="py-3 px-4 text-center font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {initialTransactions.map((tx) => {
                    const isIncome = tx.type === "INCOME";
                    const isTransfer = tx.type === "TRANSFER";

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-muted/40 transition"
                      >
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatThaiDate(tx.date)}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
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
                            <span className="text-muted-foreground">โอนเงิน</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground/80 whitespace-nowrap">
                          {tx.account?.name}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                            isTransfer
                              ? "text-primary dark:text-primary-foreground"
                              : isIncome
                              ? "text-success-text dark:text-success"
                              : "text-danger"
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
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                              title="แก้ไขรายการ"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(tx.id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-subtle hover:text-danger transition"
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
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  หน้า {currentPage} จากทั้งหมด {totalPages} หน้า
                </span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40 transition"
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
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl border border-border text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-danger" />
            <h3 className="text-base font-bold text-foreground">
              ยืนยันการลบรายการ?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              ยอดเงินในบัญชีที่เกี่ยวข้องจะถูกปรับปรุงย้อนกลับโดยอัตโนมัติ
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-danger py-2.5 text-xs font-semibold text-white hover:bg-danger-hover disabled:opacity-50 transition"
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
