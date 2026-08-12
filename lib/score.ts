export interface Recipe {
  id: string;
  name: string;
  requiredIngredients: string[];
}

export interface ScoredRecipe {
  recipe: Recipe;
  matchPercentage: number;
  missingIngredients: string[];
}

export function scoreRecipe(
  recipe: Recipe,
  availableIngredients: string[]
): ScoredRecipe {
  const available = new Set(
    availableIngredients.map((i) => i.toLowerCase().trim())
  );
  const missing = recipe.requiredIngredients.filter(
    (ing) => !available.has(ing.toLowerCase().trim())
  );
  const total = recipe.requiredIngredients.length;
  const matched = total - missing.length;
  const matchPercentage = total === 0 ? 100 : Math.round((matched / total) * 100);

  return { recipe, matchPercentage, missingIngredients: missing };
}

export function rankRecipes(
  recipes: Recipe[],
  availableIngredients: string[]
): ScoredRecipe[] {
  return recipes
    .map((r) => scoreRecipe(r, availableIngredients))
    .filter((s) => s.missingIngredients.length < 3)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
