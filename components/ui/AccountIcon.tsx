import React from "react";
import { Banknote, Building2, CreditCard, Landmark, Wallet, CircleDollarSign } from "lucide-react";

interface AccountIconProps {
  type: string;
  className?: string;
  size?: number;
}

export function AccountIcon({ type, className = "w-5 h-5", size = 20 }: AccountIconProps) {
  switch (type?.toUpperCase()) {
    case "CASH":
      return <Banknote size={size} className={className} />;
    case "BANK":
      return <Landmark size={size} className={className} />;
    case "WALLET":
      return <Wallet size={size} className={className} />;
    case "CREDIT_CARD":
      return <CreditCard size={size} className={className} />;
    case "INVESTMENT":
      return <Building2 size={size} className={className} />;
    default:
      return <CircleDollarSign size={size} className={className} />;
  }
}
