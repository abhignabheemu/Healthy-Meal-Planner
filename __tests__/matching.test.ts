import { describe, it, expect } from "vitest";
import { matchRecipes, scoreRecipe, type RecipeInput, type MatchResult } from "../lib/matching";

const recipe = (name: string, ingredients: string[]): RecipeInput => ({
  id: name.toLowerCase().replace(/\s/g, "-"),
  name,
  requiredIngredients: ingredients,
  calories: 400,
  prepTime: 25,
  healthyScore: 7,
  difficulty: "Easy",
});

describe("scoreRecipe", () => {
  const r = recipe("Chicken Stir Fry", ["Chicken", "Broccoli", "Soy Sauce", "Rice"]);

  it("returns 100 when all required ingredients are available", () => {
    const result = scoreRecipe(r, ["Chicken", "Broccoli", "Soy Sauce", "Rice"]);
    expect(result.matchPercentage).toBe(100);
    expect(result.missingIngredients).toEqual([]);
  });

  it("returns 90 when exactly one ingredient is missing", () => {
    const result = scoreRecipe(r, ["Chicken", "Broccoli", "Soy Sauce"]);
    expect(result.matchPercentage).toBe(90);
    expect(result.missingIngredients).toEqual(["Rice"]);
  });

  it("returns 80 when exactly two ingredients are missing", () => {
    const result = scoreRecipe(r, ["Chicken", "Broccoli"]);
    expect(result.matchPercentage).toBe(80);
    expect(result.missingIngredients).toEqual(["Soy Sauce", "Rice"]);
  });

  it("returns 0 when three or more ingredients are missing", () => {
    const result = scoreRecipe(r, ["Chicken"]);
    expect(result.matchPercentage).toBe(0);
    expect(result.missingIngredients).toEqual(["Broccoli", "Soy Sauce", "Rice"]);
  });

  it("handles case-insensitive matching", () => {
    const result = scoreRecipe(r, ["chicken", "BROCCOLI", "soy sauce", "rice"]);
    expect(result.matchPercentage).toBe(100);
    expect(result.missingIngredients).toEqual([]);
  });

  it("trims whitespace from ingredient names", () => {
    const result = scoreRecipe(r, ["  Chicken ", " Broccoli", "Soy Sauce ", "Rice"]);
    expect(result.matchPercentage).toBe(100);
  });

  it("handles extra available ingredients gracefully", () => {
    const result = scoreRecipe(r, ["Chicken", "Broccoli", "Soy Sauce", "Rice", "Garlic", "Onion"]);
    expect(result.matchPercentage).toBe(100);
    expect(result.missingIngredients).toEqual([]);
  });

  it("handles recipe with zero required ingredients", () => {
    const empty = recipe("Mystery Meal", []);
    const result = scoreRecipe(empty, ["Chicken"]);
    expect(result.matchPercentage).toBe(100);
    expect(result.missingIngredients).toEqual([]);
  });
});

describe("matchRecipes", () => {
  const recipes: RecipeInput[] = [
    recipe("Perfect Match", ["Chicken", "Rice"]),
    recipe("One Missing", ["Chicken", "Rice", "Broccoli"]),
    recipe("Two Missing", ["Chicken", "Rice", "Broccoli", "Soy Sauce"]),
    recipe("Three Missing", ["Chicken", "Rice", "Broccoli", "Soy Sauce", "Garlic"]),
  ];

  const available = ["Chicken", "Rice"];

  it("hides recipes with three or more missing ingredients", () => {
    const results = matchRecipes(recipes, available);
    const names = results.map((r) => r.recipe.name);
    expect(names).not.toContain("Three Missing");
  });

  it("includes recipes with zero, one, or two missing ingredients", () => {
    const results = matchRecipes(recipes, available);
    const names = results.map((r) => r.recipe.name);
    expect(names).toContain("Perfect Match");
    expect(names).toContain("One Missing");
    expect(names).toContain("Two Missing");
  });

  it("ranks by match percentage descending", () => {
    const results = matchRecipes(recipes, available);
    expect(results[0].matchPercentage).toBe(100);
    expect(results[1].matchPercentage).toBe(90);
    expect(results[2].matchPercentage).toBe(80);
  });

  it("returns missing ingredient lists for each result", () => {
    const results = matchRecipes(recipes, available);
    const perfect = results.find((r) => r.recipe.name === "Perfect Match")!;
    const oneMissing = results.find((r) => r.recipe.name === "One Missing")!;
    const twoMissing = results.find((r) => r.recipe.name === "Two Missing")!;

    expect(perfect.missingIngredients).toEqual([]);
    expect(oneMissing.missingIngredients).toEqual(["Broccoli"]);
    expect(twoMissing.missingIngredients).toHaveLength(2);
    expect(twoMissing.missingIngredients).toContain("Broccoli");
    expect(twoMissing.missingIngredients).toContain("Soy Sauce");
  });

  it("breaks ties by healthyScore descending", () => {
    const tied: RecipeInput[] = [
      { ...recipe("Less Healthy", ["Chicken", "Rice", "Broccoli"]), healthyScore: 5 },
      { ...recipe("More Healthy", ["Chicken", "Rice", "Garlic"]), healthyScore: 9 },
    ];
    const results = matchRecipes(tied, ["Chicken", "Rice"]);
    expect(results[0].recipe.name).toBe("More Healthy");
    expect(results[1].recipe.name).toBe("Less Healthy");
  });

  it("breaks further ties by prep time ascending", () => {
    const tied: RecipeInput[] = [
      { ...recipe("Slow", ["Chicken", "Rice", "X"]), healthyScore: 7, prepTime: 45 },
      { ...recipe("Fast", ["Chicken", "Rice", "Y"]), healthyScore: 7, prepTime: 15 },
    ];
    const results = matchRecipes(tied, ["Chicken", "Rice"]);
    expect(results[0].recipe.name).toBe("Fast");
    expect(results[1].recipe.name).toBe("Slow");
  });

  it("returns empty array when no recipes match the threshold", () => {
    const hardRecipes = [recipe("Impossible", ["A", "B", "C", "D", "E"])];
    const results = matchRecipes(hardRecipes, ["Z"]);
    expect(results).toEqual([]);
  });

  it("handles empty recipe list", () => {
    const results = matchRecipes([], ["Chicken"]);
    expect(results).toEqual([]);
  });

  it("handles empty available ingredients", () => {
    const twoIngRecipe = [recipe("Simple", ["A", "B"])];
    const results = matchRecipes(twoIngRecipe, []);
    expect(results[0].matchPercentage).toBe(80);
  });

  it("case-insensitive matching across recipes", () => {
    const r = [recipe("Test", ["chicken", "RICE"])];
    const results = matchRecipes(r, ["Chicken", "rice"]);
    expect(results[0].matchPercentage).toBe(100);
  });
});
