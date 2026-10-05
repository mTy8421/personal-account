"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { PinLockGatekeeper } from "@/components/auth/PinLockGatekeeper";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenNewTransaction = () => {
    setIsDialogOpen(true);
  };

  return (
    <PinLockGatekeeper>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <Sidebar onOpenNewTransaction={handleOpenNewTransaction} />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile Top Header and Bottom Navigation */}
          <MobileNav onOpenNewTransaction={handleOpenNewTransaction} />

          {/* Main Page Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>

        {/* Global Quick Add Transaction Dialog */}
        <TransactionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    </PinLockGatekeeper>
  );
}
