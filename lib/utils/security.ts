import crypto from "crypto";

const SECRET_KEY = process.env.APP_SECRET || "default-secret-expense-tracker-local-2026";
const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = "sha512";

/**
 * สุ่ม Salt สำหรับการแฮช PIN
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * แฮช PIN ด้วย PBKDF2 (SHA-512) พร้อม Salt
 */
export function hashPin(pin: string, salt: string): string {
  const hash = crypto.pbkdf2Sync(pin, salt, ITERATIONS, KEY_LEN, DIGEST);
  return hash.toString("hex");
}

/**
 * ตรวจสอบความถูกต้องของ PIN
 */
export function verifyPin(pin: string, salt: string, expectedHash: string): boolean {
  const computedHash = hashPin(pin, salt);
  return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(expectedHash, "hex"));
}

/**
 * สร้าง Token สำหรับ Session การปลดล็อก (HMAC SHA-256)
 */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    authenticated: true,
    issuedAt: Date.now(),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * ตรวจสอบ Session Token
 */
export function verifySessionToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(encodedPayload)
      .digest("base64url");

    if (signature !== expectedSignature) return false;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (!payload.authenticated) return false;

    // มีอายุ 7 วันสำหรับ Local Usage
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.issuedAt > maxAgeMs) return false;

    return true;
  } catch {
    return false;
  }
}
