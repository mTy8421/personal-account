"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";
import { CategoryData } from "@/lib/types";
import { Plus, Edit2, Trash2, X, Tags } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface CategoriesClientProps {
  categories: CategoryData[];
}

const AVAILABLE_ICONS = [
  "Utensils", "Coffee", "Car", "Home", "ShoppingBag", "Zap",
  "HeartPulse", "Tv", "GraduationCap", "Receipt", "Briefcase", "Laptop",
  "Gift", "Store", "TrendingUp", "PlusCircle", "Plane", "Fuel",
  "Smartphone", "Wifi", "CreditCard", "Tag"
];

const AVAILABLE_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#64748b"
];

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryData | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [icon, setIcon] = useState("Tag");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);

  const filtered = categories.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName("");
    setType(activeTab);
    setIcon("Tag");
    setColor("#3b82f6");
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryData) => {
    setEditingCat(cat);
    setName(cat.name);
    setType(cat.type as any);
    setIcon(cat.icon);
    setColor(cat.color);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name: name.trim(),
          type,
          icon,
          color,
        });
      } else {
        await createCategory({
          name: name.trim(),
          type,
          icon,
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
    if (!confirm("คุณต้องการลบหมวดหมู่นี้หรือไม่?")) return;
    try {
      await deleteCategory(id);
      router.refresh();
    } catch {
      alert("ไม่สามารถลบหมวดหมู่ได้");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            หมวดหมู่ (Categories)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            จัดการหมวดหมู่รายรับและรายจ่าย พร้อมกำหนดไอคอนและสี
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === "EXPENSE"
              ? "border-rose-500 text-rose-600 dark:text-rose-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          หมวดหมู่รายจ่าย ({categories.filter((c) => c.type === "EXPENSE").length})
        </button>
        <button
          onClick={() => setActiveTab("INCOME")}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === "INCOME"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          หมวดหมู่รายรับ ({categories.filter((c) => c.type === "INCOME").length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 group"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.icon} size={20} />
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                  title="แก้ไข"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  title="ลบ"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {cat.name}
              </h3>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                {cat._count?.transactions || 0} รายการ
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingCat ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
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
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ค่าอาหาร, กาแฟ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  ประเภท *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="EXPENSE">รายจ่าย (Expense)</option>
                  <option value="INCOME">รายรับ (Income)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  เลือกไอคอน
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  {AVAILABLE_ICONS.map((iName) => (
                    <button
                      key={iName}
                      type="button"
                      onClick={() => setIcon(iName)}
                      className={`flex h-10 items-center justify-center rounded-lg transition ${
                        icon === iName
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <CategoryIcon name={iName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  เลือกสี
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition ${
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
