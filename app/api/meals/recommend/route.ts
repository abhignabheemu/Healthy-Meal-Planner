import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { matchRecipes, type RecipeInput } from "@/lib/matching";

interface RecommendRequest {
  ingredients: string[];
  dietTags?: string[];
}

function validateBody(body: unknown): body is RecommendRequest {
  if (typeof body !== "object" || body === null) return false;
  const obj = body as Record<string, unknown>;
  if (!Array.isArray(obj.ingredients)) return false;
  if (obj.ingredients.length === 0) return false;
  if (!obj.ingredients.every((i: unknown) => typeof i === "string" && i.trim().length > 0)) return false;
  if (obj.dietTags !== undefined) {
    if (!Array.isArray(obj.dietTags)) return false;
    if (!obj.dietTags.every((t: unknown) => typeof t === "string" && t.trim().length > 0)) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[api/meals/recommend] invalid JSON body", error);
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      { error: "Request must include a non-empty 'ingredients' array of strings" },
      { status: 400 }
    );
  }

  try {
    const { ingredients, dietTags } = body;
    const normalizedIngredients = Array.from(new Set(ingredients.map((item) => item.trim()))).filter(Boolean);

    const recipes = await prisma.recipe.findMany({
      where: dietTags?.length
        ? { dietTags: { some: { dietTag: { name: { in: dietTags } } } } }
        : undefined,
      include: {
        ingredients: { include: { ingredient: true } },
        dietTags: { include: { dietTag: true } },
      },
    });

    const recipeInputs: RecipeInput[] = recipes.map((r) => ({
      id: String(r.id),
      name: r.name,
      requiredIngredients: r.ingredients
        .filter((ri) => ri.required)
        .map((ri) => ri.ingredient.name),
      calories: r.calories,
      prepTime: r.prepTime,
      healthyScore: Math.round((1 - r.calories / 1000) * 10),
      difficulty: r.difficulty,
    }));

    const results = matchRecipes(recipeInputs, normalizedIngredients);

    return NextResponse.json({
      results: results.map((m) => ({
        id: m.recipe.id,
        name: m.recipe.name,
        matchPercentage: m.matchPercentage,
        missingIngredients: m.missingIngredients,
        calories: m.recipe.calories,
        prepTime: m.recipe.prepTime,
        difficulty: m.recipe.difficulty,
      })),
    });
  } catch (error) {
    console.error("[api/meals/recommend] failed to generate recommendations", error);
    return NextResponse.json(
      { error: "Unable to generate meal recommendations" },
      { status: 500 }
    );
  }
}
