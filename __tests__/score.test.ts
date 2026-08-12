import { describe, it, expect } from "vitest";
import { scoreRecipe, rankRecipes, type Recipe } from "@/lib/score";

const chickenStirFry: Recipe = {
  id: "1",
  name: "Chicken Stir Fry",
  requiredIngredients: ["chicken", "broccoli", "soy sauce", "rice"],
};

const simpleSalad: Recipe = {
  id: "2",
  name: "Simple Salad",
  requiredIngredients: ["lettuce", "tomato", "olive oil"],
};

const pastaRecipe: Recipe = {
  id: "3",
  name: "Pasta Primavera",
  requiredIngredients: ["pasta", "bell pepper", "zucchini", "garlic", "olive oil"],
};

describe("scoreRecipe", () => {
  it("returns 100% when all ingredients are available", () => {
    const result = scoreRecipe(chickenStirFry, [
      "chicken",
      "broccoli",
      "soy sauce",
      "rice",
    ]);
    expect(result.matchPercentage).toBe(100);
    expect(result.missingIngredients).toEqual([]);
  });

  it("calculates correct percentage with missing ingredients", () => {
    const result = scoreRecipe(chickenStirFry, ["chicken", "rice"]);
    expect(result.matchPercentage).toBe(50);
    expect(result.missingIngredients).toEqual(["broccoli", "soy sauce"]);
  });

  it("handles case-insensitive matching", () => {
    const result = scoreRecipe(simpleSalad, ["Lettuce", "TOMATO", "Olive Oil"]);
    expect(result.matchPercentage).toBe(100);
  });

  it("handles recipe with no required ingredients", () => {
    const empty: Recipe = { id: "x", name: "Water", requiredIngredients: [] };
    const result = scoreRecipe(empty, ["anything"]);
    expect(result.matchPercentage).toBe(100);
  });
});

describe("rankRecipes", () => {
  it("filters out recipes with 3+ missing ingredients", () => {
    const results = rankRecipes([chickenStirFry, simpleSalad], ["lettuce", "tomato", "olive oil"]);
    expect(results).toHaveLength(1);
    expect(results[0].recipe.name).toBe("Simple Salad");
  });

  it("ranks by match percentage descending", () => {
    const results = rankRecipes(
      [chickenStirFry, simpleSalad, pastaRecipe],
      ["chicken", "broccoli", "soy sauce", "rice", "lettuce", "tomato", "olive oil", "pasta", "garlic"]
    );
    expect(results[0].matchPercentage).toBeGreaterThanOrEqual(results[1].matchPercentage);
  });

  it("returns empty array when no recipes match threshold", () => {
    const results = rankRecipes([pastaRecipe], ["chicken"]);
    expect(results).toEqual([]);
  });
});
