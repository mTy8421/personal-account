"use server";

import prisma from "@/lib/prisma";
import { safeRevalidatePath } from "@/lib/utils/revalidate";

export async function getCategories(type?: string, onlyActive: boolean = true) {
  return await prisma.category.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(onlyActive ? { isActive: true } : {}),
    },
    include: {
      _count: {
        select: { transactions: true, budgets: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: {
  name: string;
  type: string;
  icon?: string;
  color?: string;
}) {
  const category = await prisma.category.create({
    data: {
      name: data.name,
      type: data.type,
      icon: data.icon || "Tag",
      color: data.color || "#64748b",
      isActive: true,
    },
  });

  safeRevalidatePath("/categories");
  safeRevalidatePath("/transactions");
  safeRevalidatePath("/dashboard");
  return category;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    type?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
  }
) {
  await prisma.category.update({
    where: { id },
    data,
  });

  safeRevalidatePath("/categories");
  safeRevalidatePath("/transactions");
  safeRevalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const count = await prisma.transaction.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    // ซ่อนหมวดหมู่แทนการลบถาวรหากมีธุรกรรมผูกอยู่
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    await prisma.category.delete({
      where: { id },
    });
  }

  safeRevalidatePath("/categories");
  safeRevalidatePath("/transactions");
  safeRevalidatePath("/dashboard");
  return { success: true };
}
