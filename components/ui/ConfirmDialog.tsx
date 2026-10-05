"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { ModalWrapper } from "./ModalWrapper";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  /** "danger" shows red confirm button, "warning" shows yellow */
  variant?: "danger" | "warning";
}

/**
 * Reusable confirmation dialog with accessible modal.
 * Replaces native confirm() / alert() calls.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "ยืนยันการดำเนินการ?",
  message = "การดำเนินการนี้ไม่สามารถย้อนกลับได้",
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  variant = "danger",
}: ConfirmDialogProps) {
  const finalConfirm = confirmText || confirmLabel || "ยืนยัน";
  const finalCancel = cancelText || cancelLabel || "ยกเลิก";

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} ariaLabel={title}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl border border-border text-center">
        <AlertTriangle
          className={`mx-auto mb-3 h-10 w-10 ${
            variant === "danger" ? "text-danger" : "text-warning"
          }`}
        />
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            {finalCancel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white disabled:opacity-50 transition ${
              variant === "danger"
                ? "bg-danger hover:bg-danger-hover"
                : "bg-warning hover:bg-warning-hover text-warning-foreground"
            }`}
          >
            {finalConfirm}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
