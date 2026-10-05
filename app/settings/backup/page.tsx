import React from "react";
import prisma from "@/lib/prisma";
import { BackupClient } from "./BackupClient";

export const dynamic = "force-dynamic";

export default async function BackupPage() {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  return <BackupClient lastBackupAt={config?.lastBackupAt} />;
}
