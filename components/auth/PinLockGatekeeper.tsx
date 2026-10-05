"use client";

import React, { useEffect, useState } from "react";
import { getAuthStatus } from "@/lib/actions/auth";
import { PinLockModal } from "./PinLockModal";

export function PinLockGatekeeper({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    async function checkLock() {
      try {
        const status = await getAuthStatus();
        if (status.isPinEnabled && !status.isUnlocked) {
          setLocked(true);
        } else {
          setLocked(false);
        }
      } catch (err) {
        console.error("Lock check error:", err);
      } finally {
        setChecked(true);
      }
    }

    checkLock();
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {locked && <PinLockModal onUnlocked={() => setLocked(false)} />}
      <div className={locked ? "pointer-events-none filter blur-sm select-none" : ""}>
        {children}
      </div>
    </>
  );
}
