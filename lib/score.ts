import {
  scoreRecipe as _scoreRecipe,
  matchRecipes,
  type RecipeInput,
  type MatchResult,
} from "./matching";

export type Recipe = Pick<RecipeInput, "id" | "name" | "requiredIngredients">;

export interface ScoredRecipe {
  recipe: Recipe;
  matchPercentage: number;
  missingIngredients: string[];
}

export function scoreRecipe(recipe: Recipe, availableIngredients: string[]): ScoredRecipe {
  const input: RecipeInput = {
    ...recipe,
    calories: 0,
    prepTime: 0,
    healthyScore: 0,
    difficulty: "",
  };
  const result = _scoreRecipe(input, availableIngredients);
  return { recipe, matchPercentage: result.matchPercentage, missingIngredients: result.missingIngredients };
}

export function rankRecipes(recipes: Recipe[], availableIngredients: string[]): ScoredRecipe[] {
  const inputs: RecipeInput[] = recipes.map((r) => ({
    ...r,
    calories: 0,
    prepTime: 0,
    healthyScore: 0,
    difficulty: "",
  }));
  return matchRecipes(inputs, availableIngredients).map((result) => ({
    recipe: { id: result.recipe.id, name: result.recipe.name, requiredIngredients: result.recipe.requiredIngredients },
    matchPercentage: result.matchPercentage,
    missingIngredients: result.missingIngredients,
  }));
}
