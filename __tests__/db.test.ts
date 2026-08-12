// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_DB_PATH = resolve(__dirname, "../prisma/test.db");
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

describe("Database connectivity", () => {
  it("can execute a raw query", async () => {
    const result = await prisma.$queryRaw<[{ "1": number }]>`SELECT 1`;
    expect(result[0]["1"]).toBe(1);
  });

  it("can create and read a recipe", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "Test Recipe",
        description: "A test recipe",
        prepTime: 30,
        calories: 400,
        difficulty: "Easy",
        instructions: "Step 1: Test",
      },
    });

    expect(recipe.id).toBeDefined();
    expect(recipe.name).toBe("Test Recipe");

    const found = await prisma.recipe.findUnique({
      where: { name: "Test Recipe" },
    });
    expect(found).not.toBeNull();
    expect(found!.prepTime).toBe(30);
  });

  it("can create ingredients with categories", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Chicken Breast", category: "protein" },
    });

    expect(ingredient.id).toBeDefined();
    expect(ingredient.category).toBe("protein");
  });

  it("can create recipe-ingredient relationships", async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "Grilled Chicken",
        description: "Simple grilled chicken",
        prepTime: 20,
        calories: 300,
        difficulty: "Easy",
        instructions: "Grill the chicken",
      },
    });

    const ingredient = await prisma.ingredient.create({
      data: { name: "Olive Oil", category: "other" },
    });

    const link = await prisma.recipeIngredient.create({
      data: {
        recipeId: recipe.id,
        ingredientId: ingredient.id,
        required: true,
      },
    });

    expect(link.required).toBe(true);

    const recipeWithIngredients = await prisma.recipe.findUnique({
      where: { id: recipe.id },
      include: { ingredients: { include: { ingredient: true } } },
    });

    expect(recipeWithIngredients!.ingredients).toHaveLength(1);
    expect(recipeWithIngredients!.ingredients[0].ingredient.name).toBe(
      "Olive Oil"
    );
  });

  it("can create and query diet tags", async () => {
    const tag = await prisma.dietTag.create({
      data: { name: "Vegetarian" },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "Veggie Bowl",
        description: "A vegetarian bowl",
        prepTime: 15,
        calories: 350,
        difficulty: "Easy",
        instructions: "Mix ingredients",
      },
    });

    await prisma.recipeDietTag.create({
      data: { recipeId: recipe.id, dietTagId: tag.id },
    });

    const taggedRecipes = await prisma.dietTag.findUnique({
      where: { name: "Vegetarian" },
      include: { recipes: { include: { recipe: true } } },
    });

    expect(taggedRecipes!.recipes).toHaveLength(1);
    expect(taggedRecipes!.recipes[0].recipe.name).toBe("Veggie Bowl");
  });

  it("enforces unique recipe names", async () => {
    await prisma.recipe.create({
      data: {
        name: "Unique Test",
        description: "First",
        prepTime: 10,
        calories: 200,
        difficulty: "Easy",
        instructions: "Do it",
      },
    });

    await expect(
      prisma.recipe.create({
        data: {
          name: "Unique Test",
          description: "Duplicate",
          prepTime: 10,
          calories: 200,
          difficulty: "Easy",
          instructions: "Do it again",
        },
      })
    ).rejects.toThrow();
  });
});
