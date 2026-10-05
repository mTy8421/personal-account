import React from "react";
import { getAccounts } from "@/lib/actions/accounts";
import { AccountsClient } from "./AccountsClient";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccounts(false);

  return <AccountsClient accounts={accounts as any} />;
}
