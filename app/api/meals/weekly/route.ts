import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { matchRecipes, type RecipeInput } from "@/lib/matching";
import { buildWeeklyPlan } from "@/lib/weekly";

interface WeeklyRequest {
  ingredients: string[];
  dietTags?: string[];
}

function validateBody(body: unknown): body is WeeklyRequest {
  if (typeof body !== "object" || body === null) return false;
  const obj = body as Record<string, unknown>;
  if (!Array.isArray(obj.ingredients)) return false;
  if (obj.ingredients.length === 0) return false;
  if (!obj.ingredients.every((item) => typeof item === "string" && item.trim().length > 0)) return false;
  if (obj.dietTags !== undefined) {
    if (!Array.isArray(obj.dietTags)) return false;
    if (!obj.dietTags.every((tag) => typeof tag === "string" && tag.trim().length > 0)) return false;
  }
  return true;
}

function normalizeIngredients(list: string[]) {
  return Array.from(new Set(list.map((item) => item.trim()).filter(Boolean)));
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error("[api/meals/weekly] invalid JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      { error: "Request must include a non-empty 'ingredients' array of strings" },
      { status: 400 }
    );
  }

  try {
    const { ingredients, dietTags } = body;
    const normalizedIngredients = normalizeIngredients(ingredients);

    const recipes = await prisma.recipe.findMany({
      where: dietTags?.length
        ? { dietTags: { some: { dietTag: { name: { in: dietTags } } } } }
        : undefined,
      include: {
        ingredients: { include: { ingredient: true } },
        dietTags: { include: { dietTag: true } },
      },
    });

    const recipeInputs: RecipeInput[] = recipes.map((recipe) => ({
      id: String(recipe.id),
      name: recipe.name,
      requiredIngredients: recipe.ingredients
        .filter((relation) => relation.required)
        .map((relation) => relation.ingredient.name),
      calories: recipe.calories,
      prepTime: recipe.prepTime,
      healthyScore: Math.round((1 - recipe.calories / 1000) * 10),
      difficulty: recipe.difficulty,
    }));

    const results = matchRecipes(recipeInputs, normalizedIngredients).map((result) => ({
      id: result.recipe.id,
      name: result.recipe.name,
      requiredIngredients: result.recipe.requiredIngredients,
      matchPercentage: result.matchPercentage,
      missingIngredients: result.missingIngredients,
    }));

    const plan = buildWeeklyPlan(results, 7);

    if (plan.length < 7) {
      return NextResponse.json({ plan, message: "Fewer than seven eligible meals found." });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[api/meals/weekly] failed to generate weekly plan", error);
    return NextResponse.json(
      { error: "Unable to generate weekly meal plan" },
      { status: 500 }
    );
  }
}
