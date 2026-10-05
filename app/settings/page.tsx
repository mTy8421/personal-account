import React from "react";
import prisma from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  return (
    <SettingsClient
      isPinEnabled={config?.isPinEnabled ?? false}
      currency={config?.currency || "THB"}
    />
  );
}
