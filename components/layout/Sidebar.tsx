"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  PiggyBank,
  BarChart3,
  CalendarClock,
  HardDriveDownload,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { lockSession } from "@/lib/actions/auth";

interface SidebarProps {
  onOpenNewTransaction: () => void;
}

export function Sidebar({ onOpenNewTransaction }: SidebarProps) {
  const pathname = usePathname();
  const { setTheme, isDark } = useTheme();

  const navLinks = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/transactions", label: "รายการธุรกรรม", icon: Receipt },
    { href: "/accounts", label: "บัญชีการเงิน", icon: Wallet },
    { href: "/categories", label: "หมวดหมู่", icon: Tags },
    { href: "/budgets", label: "งบประมาณ", icon: PiggyBank },
    { href: "/reports", label: "รายงานสรุป", icon: BarChart3 },
    { href: "/recurring", label: "ค่าใช้จ่ายประจำ", icon: CalendarClock },
    { href: "/settings/backup", label: "สำรอง & กู้คืน", icon: HardDriveDownload },
    { href: "/settings", label: "ตั้งค่าระบบ", icon: Settings },
  ];

  const handleLock = async () => {
    await lockSession();
    window.location.reload();
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">
            บัญชีส่วนตัว
          </h1>
          <p className="text-[11px] font-semibold text-primary dark:text-accent">
            Local-First Edition
          </p>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={onOpenNewTransaction}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover active:scale-98 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <PlusCircle className="h-5 w-5" />
        เพิ่มรายการ
      </button>

      {/* Navigation Links */}
      <nav className="mt-6 flex-1 space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/settings"
              ? pathname === "/settings"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions (Theme & Lock) */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs text-muted-foreground">ธีมหน้าจอ</span>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="สลับโหมดมืด/สว่าง"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={handleLock}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <Lock className="h-4 w-4" />
          ล็อกหน้าจอ (Lock PIN)
        </button>
      </div>
    </aside>
  );
}
