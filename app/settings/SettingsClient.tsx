"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setPinLock, resetSecurityLock } from "@/lib/actions/auth";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  Settings,
  Lock,
  Sun,
  Moon,
  Laptop,
  Shield,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  FileCode,
} from "lucide-react";
import Link from "next/link";

interface SettingsClientProps {
  isPinEnabled: boolean;
  currency: string;
}

export function SettingsClient({ isPinEnabled, currency }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [pinEnabled, setPinEnabled] = useState(isPinEnabled);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setError("รหัส PIN ต้องมีความยาวอย่างน้อย 4 หลัก");
      return;
    }
    if (newPin !== confirmPin) {
      setError("รหัส PIN ทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      await setPinLock(newPin);
      setPinEnabled(true);
      setNewPin("");
      setConfirmPin("");
      setMessage("ตั้งค่ารหัส PIN สำเร็จแล้ว");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePin = async () => {
    if (!confirm("คุณต้องการปิดการใช้งานระบบ PIN Lock หรือไม่?")) return;
    setLoading(true);
    try {
      await setPinLock(null);
      setPinEnabled(false);
      setMessage("ปิดการใช้งาน PIN Lock เรียบร้อยแล้ว");
      router.refresh();
    } catch {
      setError("ไม่สามารถปิดการใช้งานได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          ตั้งค่าระบบ (Settings)
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          จัดการความปลอดภัย สิทธิ์การเข้าถึง และการแสดงผลของแอปพลิเคชัน
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Security & PIN Lock */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ระบบรักษาความปลอดภัย (PIN Lock)
              </h2>
              <p className="text-xs text-zinc-400">
                ล็อกการเข้าถึงระบบด้วยรหัส PIN เข้ารหัสด้วย PBKDF2 (SHA-512)
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              pinEnabled
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {pinEnabled ? "เปิดใช้งานอยู่" : "ปิดใช้งาน"}
          </span>
        </div>

        <form onSubmit={handleUpdatePin} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {pinEnabled ? "เปลี่ยนรหัส PIN ใหม่ (4-8 หลัก)" : "ตั้งรหัส PIN ใหม่ (4-8 หลัก)"}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="• • • •"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-bold tracking-widest text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                ยืนยันรหัส PIN อีกครั้ง
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="• • • •"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 p-2.5 text-sm font-bold tracking-widest text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !newPin}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {pinEnabled ? "บันทึกเปลี่ยนรหัส PIN" : "เปิดใช้งานรหัส PIN"}
            </button>

            {pinEnabled && (
              <button
                type="button"
                onClick={handleDisablePin}
                disabled={loading}
                className="rounded-xl border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
              >
                ปิดใช้งาน PIN Lock
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Theme Preferences */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <Sun className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              การแสดงผลและธีม (Appearance)
            </h2>
            <p className="text-xs text-zinc-400">
              เลือกรูปแบบธีมสว่างหรือมืดตามความสะดวกในการใช้งาน
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-bold transition ${
              theme === "light"
                ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            }`}
          >
            <Sun className="h-6 w-6 mb-2 text-amber-500" />
            โหมดสว่าง (Light)
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-bold transition ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            }`}
          >
            <Moon className="h-6 w-6 mb-2 text-indigo-400" />
            โหมดมืด (Dark)
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-bold transition ${
              theme === "system"
                ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            }`}
          >
            <Laptop className="h-6 w-6 mb-2 text-zinc-500" />
            ตามระบบ (System)
          </button>
        </div>
      </div>

      {/* Local-First & Privacy Guarantee */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            สถาปัตยกรรม Local-first และความเป็นส่วนตัว
          </h2>
        </div>

        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>ฐานข้อมูลจัดเก็บในเครื่องของคุณ 100% ผ่าน SQLite (<code className="font-mono text-zinc-800 dark:text-zinc-200">./data/database.db</code>)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>ไม่มีระบบ Tracking, Google Analytics หรือ Facebook Pixel ใดๆ ทั้งสิ้น</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>ทำงานแบบ Offline ได้โดยไม่ต้องเชื่อมต่ออินเทอร์เน็ต</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>คุณเป็นเจ้าของข้อมูล 100% และสามารถสำรอง/กู้คืนข้อมูลได้ด้วยตนเอง</span>
          </li>
        </ul>

        <div className="pt-2">
          <Link
            href="/settings/backup"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            ไปยังหน้าสำรองและกู้คืนข้อมูล (Backup & Restore) →
          </Link>
        </div>
      </div>
    </div>
  );
}
