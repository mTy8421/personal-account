import { revalidatePath } from "next/cache";

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore error when running in test scripts or outside of Next.js request context
  }
}
