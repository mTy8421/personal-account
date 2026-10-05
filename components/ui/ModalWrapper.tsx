"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Title for aria-labelledby. Falls back to generic "dialog" */
  ariaLabel?: string;
  /** Additional className for the overlay */
  overlayClassName?: string;
  /** If true, clicking the overlay does NOT close the modal */
  preventOverlayClose?: boolean;
}

/**
 * Accessible modal wrapper providing:
 * - Focus trap (Tab / Shift+Tab cycle within modal)
 * - Escape key to close
 * - role="dialog", aria-modal="true", aria-label
 * - Return focus to trigger element on close
 * - Click-outside (overlay) to close
 * - Scroll lock on body while open
 */
export function ModalWrapper({
  isOpen,
  onClose,
  children,
  ariaLabel = "Dialog",
  overlayClassName = "",
  preventOverlayClose = false,
}: ModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save the previously focused element and lock body scroll
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      // Focus the modal container after render
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableSelectors =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(
        modal.querySelectorAll<HTMLElement>(focusableSelectors)
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || document.activeElement === modal) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    []
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto ${overlayClassName}`}
      onClick={(e) => {
        if (!preventOverlayClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="outline-hidden"
      >
        {children}
      </div>
    </div>
  );
}
