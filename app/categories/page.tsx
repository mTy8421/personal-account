import React from "react";
import { getCategories } from "@/lib/actions/categories";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories(undefined, false);

  return <CategoriesClient categories={categories as any} />;
}
