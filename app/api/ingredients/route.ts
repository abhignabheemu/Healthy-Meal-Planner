import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { INGREDIENT_CATEGORIES, type IngredientCategory } from "@/lib/ingredients";

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });

  const categorized: Record<IngredientCategory, { id: number; name: string }[]> = {
    protein: [],
    vegetable: [],
    carb: [],
    other: [],
  };

  for (const ingredient of ingredients) {
    const category = ingredient.category as IngredientCategory;
    if (INGREDIENT_CATEGORIES.includes(category)) {
      categorized[category].push({ id: ingredient.id, name: ingredient.name });
    } else {
      categorized.other.push({ id: ingredient.id, name: ingredient.name });
    }
  }

  return NextResponse.json({ categories: categorized });
}
