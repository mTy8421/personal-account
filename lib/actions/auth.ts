"use server";

import prisma from "@/lib/prisma";
import {
  createSessionToken,
  generateSalt,
  hashPin,
  verifyPin,
  verifySessionToken,
} from "@/lib/utils/security";
import { cookies } from "next/headers";
import { safeRevalidatePath } from "@/lib/utils/revalidate";

const SESSION_COOKIE_NAME = "expense_tracker_session";

export async function getAuthStatus() {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  if (!config || !config.isPinEnabled || !config.pinHash) {
    return { isPinEnabled: false, isUnlocked: true };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  const isUnlocked = sessionCookie ? verifySessionToken(sessionCookie.value) : false;

  return {
    isPinEnabled: true,
    isUnlocked,
  };
}

export async function unlockWithPin(pin: string) {
  const config = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });

  if (!config || !config.isPinEnabled || !config.pinHash || !config.pinSalt) {
    return { success: true };
  }

  const isValid = verifyPin(pin, config.pinSalt, config.pinHash);
  if (!isValid) {
    return { success: false, error: "รหัส PIN ไม่ถูกต้อง" };
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 วัน
  });

  safeRevalidatePath("/");
  return { success: true };
}

export async function setPinLock(newPin: string | null) {
  if (!newPin || newPin.trim().length === 0) {
    // ปิดใช้งาน PIN
    await prisma.appConfig.upsert({
      where: { id: "default" },
      update: {
        isPinEnabled: false,
        pinHash: null,
        pinSalt: null,
      },
      create: {
        id: "default",
        isPinEnabled: false,
      },
    });

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    safeRevalidatePath("/");
    return { success: true, message: "ยกเลิกการตั้งรหัส PIN เรียบร้อยแล้ว" };
  }

  if (newPin.length < 4) {
    throw new Error("รหัส PIN ต้องมีความยาวอย่างน้อย 4 หลัก");
  }

  const salt = generateSalt();
  const hash = hashPin(newPin, salt);

  await prisma.appConfig.upsert({
    where: { id: "default" },
    update: {
      isPinEnabled: true,
      pinHash: hash,
      pinSalt: salt,
    },
    create: {
      id: "default",
      isPinEnabled: true,
      pinHash: hash,
      pinSalt: salt,
    },
  });

  // ตั้ง Token ปลดล็อกให้ทันทีสำหรับผู้ใช้ปัจจุบัน
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  safeRevalidatePath("/");
  return { success: true, message: "ตั้งรหัส PIN เรียบร้อยแล้ว" };
}

export async function lockSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  safeRevalidatePath("/");
  return { success: true };
}

export async function resetSecurityLock() {
  await prisma.appConfig.upsert({
    where: { id: "default" },
    update: {
      isPinEnabled: false,
      pinHash: null,
      pinSalt: null,
    },
    create: {
      id: "default",
      isPinEnabled: false,
    },
  });

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  safeRevalidatePath("/");
  return { success: true, message: "รีเซ็ตรหัส PIN เรียบร้อยแล้ว" };
}
