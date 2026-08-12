// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_DB_PATH = resolve(__dirname, "../prisma/test-recipe.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

let prisma: InstanceType<typeof PrismaClient>;

beforeAll(async () => {
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }

  process.env.DATABASE_URL = TEST_DB_URL;

  execSync(`npx prisma migrate deploy`, {
    cwd: resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  });

  const adapter = new PrismaLibSql({ url: TEST_DB_URL });
  prisma = new PrismaClient({ adapter });
});

afterAll(async () => {
  await prisma.$disconnect();
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
});

describe("Recipe model", () => {
  it("creates a recipe with all fields", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "Chicken Stir Fry",
        description: "Quick weeknight stir fry",
        prepTime: 25,
        calories: 450,
        difficulty: "Medium",
        instructions: "1. Cut chicken. 2. Heat wok. 3. Stir fry.",
      },
    });

    expect(recipe.id).toBeDefined();
    expect(recipe.name).toBe("Chicken Stir Fry");
    expect(recipe.prepTime).toBe(25);
    expect(recipe.calories).toBe(450);
    expect(recipe.difficulty).toBe("Medium");
    expect(recipe.createdAt).toBeInstanceOf(Date);
  });

  it("retrieves a recipe by name", async () => {
    const found = await prisma.recipe.findUnique({
      where: { name: "Chicken Stir Fry" },
    });

    expect(found).not.toBeNull();
    expect(found!.description).toBe("Quick weeknight stir fry");
  });

  it("updates a recipe", async () => {
    const updated = await prisma.recipe.update({
      where: { name: "Chicken Stir Fry" },
      data: { prepTime: 30, calories: 500 },
    });

    expect(updated.prepTime).toBe(30);
    expect(updated.calories).toBe(500);
  });

  it("enforces unique recipe names", async () => {
    await expect(
      prisma.recipe.create({
        data: {
          name: "Chicken Stir Fry",
          description: "Duplicate",
          prepTime: 10,
          calories: 200,
          difficulty: "Easy",
          instructions: "N/A",
        },
      })
    ).rejects.toThrow();
  });
});

describe("RecipeIngredient relationships", () => {
  let recipeId: number;
  let chickenId: number;
  let riceId: number;
  let soySauceId: number;

  beforeAll(async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "Chicken Rice Bowl",
        description: "Simple rice bowl with chicken",
        prepTime: 20,
        calories: 550,
        difficulty: "Easy",
        instructions: "Cook rice, grill chicken, combine.",
      },
    });
    recipeId = recipe.id;

    const chicken = await prisma.ingredient.create({
      data: { name: "Chicken Thigh", category: "protein" },
    });
    chickenId = chicken.id;

    const rice = await prisma.ingredient.create({
      data: { name: "Jasmine Rice", category: "carb" },
    });
    riceId = rice.id;

    const soySauce = await prisma.ingredient.create({
      data: { name: "Soy Sauce", category: "other" },
    });
    soySauceId = soySauce.id;
  });

  it("links multiple ingredients to a recipe", async () => {
    await prisma.recipeIngredient.createMany({
      data: [
        { recipeId, ingredientId: chickenId, required: true },
        { recipeId, ingredientId: riceId, required: true },
        { recipeId, ingredientId: soySauceId, required: false },
      ],
    });

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: { include: { ingredient: true } } },
    });

    expect(recipe!.ingredients).toHaveLength(3);
  });

  it("distinguishes required from optional ingredients", async () => {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: { include: { ingredient: true } } },
    });

    const required = recipe!.ingredients.filter((ri) => ri.required);
    const optional = recipe!.ingredients.filter((ri) => !ri.required);

    expect(required).toHaveLength(2);
    expect(optional).toHaveLength(1);
    expect(optional[0].ingredient.name).toBe("Soy Sauce");
  });

  it("prevents duplicate recipe-ingredient pairs", async () => {
    await expect(
      prisma.recipeIngredient.create({
        data: { recipeId, ingredientId: chickenId, required: true },
      })
    ).rejects.toThrow();
  });

  it("queries recipes from an ingredient perspective", async () => {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: chickenId },
      include: { recipes: { include: { recipe: true } } },
    });

    expect(ingredient!.recipes.length).toBeGreaterThanOrEqual(1);
    const recipeNames = ingredient!.recipes.map((ri) => ri.recipe.name);
    expect(recipeNames).toContain("Chicken Rice Bowl");
  });

  it("creates a recipe with nested ingredient relations", async () => {
    const garlic = await prisma.ingredient.create({
      data: { name: "Garlic", category: "vegetable" },
    });
    const pasta = await prisma.ingredient.create({
      data: { name: "Spaghetti", category: "carb" },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "Garlic Pasta",
        description: "Simple garlic pasta",
        prepTime: 15,
        calories: 380,
        difficulty: "Easy",
        instructions: "Boil pasta, sauté garlic, toss together.",
        ingredients: {
          create: [
            { ingredientId: pasta.id, required: true },
            { ingredientId: garlic.id, required: true },
          ],
        },
      },
      include: { ingredients: { include: { ingredient: true } } },
    });

    expect(recipe.ingredients).toHaveLength(2);
    const names = recipe.ingredients.map((ri) => ri.ingredient.name);
    expect(names).toContain("Garlic");
    expect(names).toContain("Spaghetti");
  });

  it("deletes recipe-ingredient links without deleting the recipe or ingredient", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "Temp Recipe",
        description: "Will remove link",
        prepTime: 5,
        calories: 100,
        difficulty: "Easy",
        instructions: "N/A",
      },
    });

    const ingredient = await prisma.ingredient.create({
      data: { name: "Temp Spice", category: "other" },
    });

    const link = await prisma.recipeIngredient.create({
      data: { recipeId: recipe.id, ingredientId: ingredient.id },
    });

    await prisma.recipeIngredient.delete({ where: { id: link.id } });

    const recipeStillExists = await prisma.recipe.findUnique({
      where: { id: recipe.id },
    });
    const ingredientStillExists = await prisma.ingredient.findUnique({
      where: { id: ingredient.id },
    });

    expect(recipeStillExists).not.toBeNull();
    expect(ingredientStillExists).not.toBeNull();
  });
});
