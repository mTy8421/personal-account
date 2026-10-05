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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          ตั้งค่าระบบ (Settings)
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          จัดการความปลอดภัย สิทธิ์การเข้าถึง และการแสดงผลของแอปพลิเคชัน
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-success-subtle p-4 text-xs font-semibold text-success-text border border-success/30">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-subtle p-4 text-xs font-semibold text-danger-text border border-danger/30">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Security & PIN Lock */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                ระบบรักษาความปลอดภัย (PIN Lock)
              </h2>
              <p className="text-xs text-muted-foreground">
                ล็อกการเข้าถึงระบบด้วยรหัส PIN เข้ารหัสด้วย PBKDF2 (SHA-512)
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold border ${
              pinEnabled
                ? "bg-success-subtle text-success-text border-success/30"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {pinEnabled ? "เปิดใช้งานอยู่" : "ปิดใช้งาน"}
          </span>
        </div>

        <form onSubmit={handleUpdatePin} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                {pinEnabled ? "เปลี่ยนรหัส PIN ใหม่ (4-8 หลัก)" : "ตั้งรหัส PIN ใหม่ (4-8 หลัก)"}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="• • • •"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-bold tracking-widest text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                ยืนยันรหัส PIN อีกครั้ง
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="• • • •"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card p-2.5 text-sm font-bold tracking-widest text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !newPin}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary-hover disabled:opacity-50 transition focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <KeyRound className="h-4 w-4" />
              {pinEnabled ? "บันทึกเปลี่ยนรหัส PIN" : "เปิดใช้งานรหัส PIN"}
            </button>

            {pinEnabled && (
              <button
                type="button"
                onClick={handleDisablePin}
                disabled={loading}
                className="rounded-xl border border-danger/40 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger-subtle transition"
              >
                ปิดใช้งาน PIN Lock
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Theme Preferences */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <Sun className="h-5 w-5 text-warning" />
          <div>
            <h2 className="text-base font-bold text-foreground">
              การแสดงผลและธีม (Appearance)
            </h2>
            <p className="text-xs text-muted-foreground">
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
                ? "border-primary bg-primary-subtle text-primary shadow-xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sun className="h-6 w-6 mb-2 text-warning" />
            โหมดสว่าง (Light)
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-bold transition ${
              theme === "dark"
                ? "border-primary bg-primary-subtle text-primary shadow-xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Moon className="h-6 w-6 mb-2 text-primary dark:text-accent" />
            โหมดมืด (Dark)
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-xs font-bold transition ${
              theme === "system"
                ? "border-primary bg-primary-subtle text-primary shadow-xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Laptop className="h-6 w-6 mb-2 text-muted-foreground" />
            ตามระบบ (System)
          </button>
        </div>
      </div>

      {/* Local-First & Privacy Guarantee */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            สถาปัตยกรรม Local-first และความเป็นส่วนตัว
          </h2>
        </div>

        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span>ฐานข้อมูลจัดเก็บในเครื่องของคุณ 100% ผ่าน SQLite (<code className="font-mono text-foreground font-semibold">./data/database.db</code>)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span>ไม่มีระบบ Tracking, Google Analytics หรือ Facebook Pixel ใดๆ ทั้งสิ้น</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span>ทำงานแบบ Offline ได้โดยไม่ต้องเชื่อมต่ออินเทอร์เน็ต</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span>คุณเป็นเจ้าของข้อมูล 100% และสามารถสำรอง/กู้คืนข้อมูลได้ด้วยตนเอง</span>
          </li>
        </ul>

        <div className="pt-2">
          <Link
            href="/settings/backup"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover hover:underline transition"
          >
            ไปยังหน้าสำรองและกู้คืนข้อมูล (Backup & Restore) →
          </Link>
        </div>
      </div>
    </div>
  );
}
