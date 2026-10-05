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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          สำรองและกู้คืนข้อมูล (Backup & Restore)
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          ข้อมูลทั้งหมดถูกจัดเก็บอยู่บนเครื่องของคุณเอง สามารถดาวน์โหลดเก็บไว้และนำกลับมาใช้งานได้ตลอดเวลา
        </p>
      </div>

      {/* Backup Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              สถานะความปลอดภัยของข้อมูล
            </h3>
            <p className="text-xs text-muted-foreground">
              ตำแหน่งฐานข้อมูล SQLite: <code className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground">./data/database.db</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>
            Backup ล่าสุด:{" "}
            <strong className="text-foreground">
              {lastBackupAt ? formatThaiDateTime(lastBackupAt) : "ยังไม่มีการสำรองข้อมูล"}
            </strong>
          </span>
        </div>
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

      {/* Export Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HardDriveDownload className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            ส่งออกข้อมูล (Export Backup)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          เลือกรูปแบบไฟล์ที่คุณต้องการบันทึกเก็บไว้สำรอง:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* JSON Export */}
          <a
            href="/api/backup/export?format=json"
            download
            className="flex flex-col justify-between rounded-xl border border-border p-4 hover:border-primary hover:bg-primary-subtle/30 transition group"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary mb-3 group-hover:scale-105 transition">
                <FileJson className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                ไฟล์ JSON (.json)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                บันทึกข้อมูลครบถ้วน 100% (บัญชี, หมวดหมู่, ธุรกรรม, งบประมาณ, รายจ่ายประจำ)
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-primary group-hover:underline">
              ดาวน์โหลด JSON →
            </span>
          </a>

          {/* CSV Export */}
          <a
            href="/api/backup/export?format=csv"
            download
            className="flex flex-col justify-between rounded-xl border border-border p-4 hover:border-accent hover:bg-accent-subtle/30 transition group"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent mb-3 group-hover:scale-105 transition">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                ไฟล์ CSV (.csv)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                สำหรับเปิดและคำนวณใน Microsoft Excel, Google Sheets, หรือ Numbers
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-accent-text dark:text-accent group-hover:underline">
              ดาวน์โหลด CSV →
            </span>
          </a>

          {/* SQLite Export */}
          <a
            href="/api/backup/export?format=sqlite"
            download
            className="flex flex-col justify-between rounded-xl border border-border p-4 hover:border-success hover:bg-success-subtle/30 transition group"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-subtle text-success mb-3 group-hover:scale-105 transition">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                ไฟล์ฐานข้อมูล (.db)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                ไฟล์ SQLite database.db ฉบับสมบูรณ์ สามารถนำไปเปิดด้วย DB Browser for SQLite ได้
              </p>
            </div>
            <span className="mt-4 text-xs font-bold text-success-text dark:text-success group-hover:underline">
              ดาวน์โหลด SQLite .db →
            </span>
          </a>
        </div>
      </div>

      {/* Import / Restore Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-warning-text dark:text-warning" />
          <h2 className="text-base font-bold text-foreground">
            กู้คืนข้อมูล (Restore Backup)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          นำเข้าไฟล์สำรองข้อมูล (JSON หรือ .db) ที่คุณเคยบันทึกไว้เพื่อนำข้อมูลกลับมา
        </p>

        <div className="mt-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
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
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-xs font-semibold text-foreground">
              {selectedFile ? selectedFile.name : "คลิกเพื่อเลือกไฟล์ Backup (.json หรือ .db)"}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              รองรับทั้งไฟล์ JSON Snapshot และไฟล์ SQLite (.db)
            </span>
          </label>

          {selectedFile && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 rounded-xl bg-warning px-5 py-2.5 text-xs font-bold text-warning-foreground shadow-xs hover:bg-warning-hover transition focus:outline-hidden focus:ring-2 focus:ring-warning"
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
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-foreground">
              คำเตือน
            </h3>
            <p className="mt-2 text-sm text-foreground font-semibold">
              การ Restore จะเขียนทับข้อมูลปัจจุบัน
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ข้อมูลปัจจุบันทั้งหมดจะถูกแทนที่ด้วยข้อมูลจากไฟล์: <strong>{selectedFile?.name}</strong>
              <br />ต้องการดำเนินการต่อหรือไม่?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmRestore}
                className="flex-1 rounded-xl bg-danger py-2.5 text-xs font-semibold text-white hover:bg-danger-hover disabled:opacity-50 transition"
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
