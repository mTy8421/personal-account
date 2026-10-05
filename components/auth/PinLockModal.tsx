"use client";

import React, { useState } from "react";
import { unlockWithPin, resetSecurityLock } from "@/lib/actions/auth";
import { Lock, Delete, AlertTriangle, ShieldCheck } from "lucide-react";

interface PinLockModalProps {
  onUnlocked?: () => void;
}

export function PinLockModal({ onUnlocked }: PinLockModalProps) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      setError("กรุณากรอก PIN อย่างน้อย 4 หลัก");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await unlockWithPin(pin);
      if (res.success) {
        if (onUnlocked) onUnlocked();
        window.location.reload();
      } else {
        setError(res.error || "รหัส PIN ไม่ถูกต้อง");
        setPin("");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการตรวจสอบ");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetSecurityLock();
      setShowResetConfirm(false);
      window.location.reload();
    } catch {
      setError("ไม่สามารถรีเซ็ต PIN ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            ระบบบัญชีส่วนตัว
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            กรุณากรอกรหัส PIN เพื่อเข้าใช้งาน
          </p>

          {/* Dots Indicator */}
          <div className="my-5 flex justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full border-2 transition-all ${
                  index < pin.length
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="mb-3 text-sm font-medium text-rose-500 dark:text-rose-400">
              {error}
            </p>
          )}

          {/* Numpad */}
          <div className="grid w-full grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="flex h-14 items-center justify-center rounded-xl bg-zinc-100 text-xl font-semibold text-zinc-800 transition active:scale-95 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="flex h-14 items-center justify-center rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="flex h-14 items-center justify-center rounded-xl bg-zinc-100 text-xl font-semibold text-zinc-800 transition active:scale-95 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-14 items-center justify-center rounded-xl text-zinc-600 transition active:scale-95 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="ลบตัวเลข"
            >
              <Delete className="h-6 w-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || pin.length < 4}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <ShieldCheck className="h-5 w-5" />
            {loading ? "กำลังตรวจสอบ..." : "ปลดล็อก"}
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="mt-4 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            ลืมรหัส PIN? รีเซ็ตรหัสผ่าน
          </button>
        </div>

        {/* Modal ยืนยันการรีเซ็ต PIN */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
              <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-amber-500" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                รีเซ็ตรหัส PIN
              </h3>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                การรีเซ็ตจะยกเลิกการล็อกด้วย PIN และอนุญาตให้เข้าสู่ระบบได้ทันที
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-lg border border-zinc-300 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-medium text-white hover:bg-rose-700"
                >
                  ยืนยันรีเซ็ต
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
