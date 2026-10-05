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
      <header className="lg:hidden flex h-14 items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-bold text-foreground">บัญชีส่วนตัว</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="สลับโหมดมืด/สว่าง"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Floating Action Button (FAB) สำหรับ Quick Add */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onOpenNewTransaction}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition active:scale-95 hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="เพิ่มรายการด่วน"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
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
          <div className="relative ml-auto flex h-full w-72 flex-col bg-card p-5 shadow-2xl border-l border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-foreground">เมนูเพิ่มเติม</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
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
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
