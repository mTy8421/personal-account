"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Menu,
  Plus,
  X,
  Wallet,
  Tags,
  CalendarClock,
  HardDriveDownload,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface MobileNavProps {
  onOpenNewTransaction: () => void;
}

export function MobileNav({ onOpenNewTransaction }: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDark, setTheme } = useTheme();

  const primaryTabs = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/transactions", label: "ธุรกรรม", icon: Receipt },
    { href: "/budgets", label: "งบประมาณ", icon: PiggyBank },
    { href: "/reports", label: "รายงาน", icon: BarChart3 },
  ];

  const drawerLinks = [
    { href: "/accounts", label: "บัญชีการเงิน", icon: Wallet },
    { href: "/categories", label: "หมวดหมู่รายรับ-จ่าย", icon: Tags },
    { href: "/recurring", label: "ค่าใช้จ่ายประจำ", icon: CalendarClock },
    { href: "/settings/backup", label: "สำรอง & กู้คืนข้อมูล", icon: HardDriveDownload },
    { href: "/settings", label: "ตั้งค่าระบบ", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">บัญชีส่วนตัว</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            title="สลับโหมดมืด/สว่าง"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Floating Action Button (FAB) สำหรับ Quick Add */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onOpenNewTransaction}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition active:scale-95 hover:bg-emerald-700"
          aria-label="เพิ่มรายการด่วน"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/95 backdrop-blur-md px-2 dark:border-zinc-800 dark:bg-zinc-950/95">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Side Drawer สำหรับเมนูเพิ่มเติม */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-white p-5 shadow-2xl dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">เมนูเพิ่มเติม</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1">
              {drawerLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
