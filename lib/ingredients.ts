export const INGREDIENT_CATEGORIES = ["protein", "vegetable", "carb", "other"] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export function isValidCategory(category: string): category is IngredientCategory {
  return (INGREDIENT_CATEGORIES as readonly string[]).includes(category);
}
