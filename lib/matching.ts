export interface RecipeInput {
  id: string;
  name: string;
  requiredIngredients: string[];
  calories: number;
  prepTime: number;
  healthyScore: number;
  difficulty: string;
}

export interface MatchResult {
  recipe: RecipeInput;
  matchPercentage: number;
  missingIngredients: string[];
}

export function scoreRecipe(recipe: RecipeInput, availableIngredients: string[]): MatchResult {
  const available = new Set(availableIngredients.map((i) => i.toLowerCase().trim()));
  const missing = recipe.requiredIngredients.filter(
    (ing) => !available.has(ing.toLowerCase().trim())
  );

  let matchPercentage: number;
  if (missing.length === 0) {
    matchPercentage = 100;
  } else if (missing.length === 1) {
    matchPercentage = 90;
  } else if (missing.length === 2) {
    matchPercentage = 80;
  } else {
    matchPercentage = 0;
  }

  return { recipe, matchPercentage, missingIngredients: missing };
}

export function matchRecipes(recipes: RecipeInput[], availableIngredients: string[]): MatchResult[] {
  return recipes
    .map((r) => scoreRecipe(r, availableIngredients))
    .filter((result) => result.missingIngredients.length <= 2)
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      if (b.recipe.healthyScore !== a.recipe.healthyScore) return b.recipe.healthyScore - a.recipe.healthyScore;
      return a.recipe.prepTime - b.recipe.prepTime;
    });
}
