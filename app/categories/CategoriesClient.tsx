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
  "#083D77", // Primary
  "#2A9D8F", // Success
  "#DA4167", // Danger
  "#F4D35E", // Warning
  "#F78764", // Accent
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#06b6d4", "#64748b"
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            หมวดหมู่ (Categories)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            จัดการหมวดหมู่รายรับและรายจ่าย พร้อมกำหนดไอคอนและสี
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover transition focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === "EXPENSE"
              ? "border-danger text-danger"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          หมวดหมู่รายจ่าย ({categories.filter((c) => c.type === "EXPENSE").length})
        </button>
        <button
          onClick={() => setActiveTab("INCOME")}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === "INCOME"
              ? "border-success text-success-text dark:text-success"
              : "border-transparent text-muted-foreground hover:text-foreground"
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
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-xs group"
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
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  title="แก้ไข"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-danger-subtle hover:text-danger transition"
                  title="ลบ"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold text-foreground truncate">
                {cat.name}
              </h3>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {cat._count?.transactions || 0} รายการ
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                {editingCat ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
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
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ค่าอาหาร, กาแฟ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  ประเภท *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-medium text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                >
                  <option value="EXPENSE">รายจ่าย (Expense)</option>
                  <option value="INCOME">รายรับ (Income)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  เลือกไอคอน
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-border rounded-xl">
                  {AVAILABLE_ICONS.map((iName) => (
                    <button
                      key={iName}
                      type="button"
                      onClick={() => setIcon(iName)}
                      className={`flex h-10 items-center justify-center rounded-lg transition ${
                        icon === iName
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <CategoryIcon name={iName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  เลือกสี
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition ${
                        color === c ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
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
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition focus:outline-hidden focus:ring-2 focus:ring-primary"
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
