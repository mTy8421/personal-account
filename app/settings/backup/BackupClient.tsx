"use client";

import React, { useState } from "react";
import { formatThaiDateTime } from "@/lib/utils/date";
import {
  HardDriveDownload,
  UploadCloud,
  FileJson,
  FileSpreadsheet,
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface BackupClientProps {
  lastBackupAt?: Date | null;
}

export function BackupClient({ lastBackupAt }: BackupClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
      setMessage("");
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (selectedFile.name.endsWith(".db")) {
        formData.append("format", "sqlite");
      } else {
        formData.append("format", "json");
      }

      const res = await fetch("/api/backup/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการกู้คืนข้อมูล");
      }

      setMessage(data.message || "กู้คืนข้อมูลเรียบร้อยแล้ว");
      setShowConfirmModal(false);
      setSelectedFile(null);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "การกู้คืนข้อมูลล้มเหลว");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          สำรองและกู้คืนข้อมูล (Backup & Restore)
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          ข้อมูลทั้งหมดถูกจัดเก็บอยู่บนเครื่องของคุณเอง สามารถดาวน์โหลดเก็บไว้และนำกลับมาใช้งานได้ตลอดเวลา
        </p>
      </div>

      {/* Backup Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              สถานะความปลอดภัยของข้อมูล
            </h3>
            <p className="text-xs text-zinc-400">
              ตำแหน่งฐานข้อมูล SQLite: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">./data/database.db</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Clock className="h-4 w-4 text-emerald-500" />
          <span>
            Backup ล่าสุด:{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {lastBackupAt ? formatThaiDateTime(lastBackupAt) : "ยังไม่มีการสำรองข้อมูล"}
            </strong>
          </span>
        </div>
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

      {/* Export Section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center gap-2">
          <HardDriveDownload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            ส่งออกข้อมูล (Export Backup)
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          เลือกรูปแบบไฟล์ที่คุณต้องการบันทึกเก็บไว้สำรอง:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* JSON Export */}
          <a
            href="/api/backup/export?format=json"
            download
            className="flex flex-col justify-between rounded-xl border border-zinc-200 p-4 hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-zinc-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20 transition group"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3 group-hover:scale-105 transition">
                <FileJson className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ไฟล์ JSON (.json)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                บันทึกข้อมูลครบถ้วน 100% (บัญชี, หมวดหมู่, ธุรกรรม, งบประมาณ, รายจ่ายประจำ)
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ดาวน์โหลด JSON →
            </span>
          </a>

          {/* CSV Export */}
          <a
            href="/api/backup/export?format=csv"
            download
            className="flex flex-col justify-between rounded-xl border border-zinc-200 p-4 hover:border-blue-500 hover:bg-blue-50/30 dark:border-zinc-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/20 transition group"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-3 group-hover:scale-105 transition">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ไฟล์ CSV (.csv)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                สำหรับเปิดและคำนวณใน Microsoft Excel, Google Sheets, หรือ Numbers
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400">
              ดาวน์โหลด CSV →
            </span>
          </a>

          {/* SQLite Export */}
          <a
            href="/api/backup/export?format=sqlite"
            download
            className="flex flex-col justify-between rounded-xl border border-zinc-200 p-4 hover:border-purple-500 hover:bg-purple-50/30 dark:border-zinc-800 dark:hover:border-purple-600 dark:hover:bg-purple-950/20 transition group"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 mb-3 group-hover:scale-105 transition">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ไฟล์ฐานข้อมูล (.db)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                ไฟล์ SQLite database.db ฉบับสมบูรณ์ สามารถนำไปเปิดด้วย DB Browser for SQLite ได้
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-purple-600 dark:text-purple-400">
              ดาวน์โหลด SQLite .db →
            </span>
          </a>
        </div>
      </div>

      {/* Import / Restore Section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            กู้คืนข้อมูล (Restore Backup)
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          นำเข้าไฟล์สำรองข้อมูล (JSON หรือ .db) ที่คุณเคยบันทึกไว้เพื่อนำข้อมูลกลับมา
        </p>

        <div className="mt-2 rounded-xl border-2 border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
          <input
            type="file"
            id="backup-file-input"
            accept=".json,.db"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="backup-file-input"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <UploadCloud className="h-10 w-10 text-zinc-400 mb-2" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {selectedFile ? selectedFile.name : "คลิกเพื่อเลือกไฟล์ Backup (.json หรือ .db)"}
            </span>
            <span className="text-[11px] text-zinc-400 mt-1">
              รองรับทั้งไฟล์ JSON Snapshot และไฟล์ SQLite (.db)
            </span>
          </label>

          {selectedFile && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700"
              >
                ดำเนินการกู้คืนข้อมูล (Restore)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              คำเตือน
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
              การ Restore จะเขียนทับข้อมูลปัจจุบัน
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              ข้อมูลปัจจุบันทั้งหมดจะถูกแทนที่ด้วยข้อมูลจากไฟล์: <strong>{selectedFile?.name}</strong>
              <br />ต้องการดำเนินการต่อหรือไม่?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmRestore}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? "กำลังดำเนินการ..." : "ยืนยัน Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
