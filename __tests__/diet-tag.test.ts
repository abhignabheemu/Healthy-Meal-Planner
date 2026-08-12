// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_DB_PATH = resolve(__dirname, "../prisma/test-diet-tag.db");
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

describe("DietTag model", () => {
  const DIET_TAGS = [
    "Vegetarian",
    "Vegan",
    "HighProtein",
    "LowCarb",
    "QuickMeal",
  ];

  it("creates all supported diet tags", async () => {
    for (const name of DIET_TAGS) {
      const tag = await prisma.dietTag.create({ data: { name } });
      expect(tag.id).toBeDefined();
      expect(tag.name).toBe(name);
    }

    const all = await prisma.dietTag.findMany();
    expect(all).toHaveLength(5);
  });

  it("enforces unique tag names", async () => {
    await expect(
      prisma.dietTag.create({ data: { name: "Vegetarian" } })
    ).rejects.toThrow();
  });

  it("finds a tag by name", async () => {
    const tag = await prisma.dietTag.findUnique({
      where: { name: "HighProtein" },
    });
    expect(tag).not.toBeNull();
    expect(tag!.name).toBe("HighProtein");
  });
});

describe("RecipeDietTag relationships", () => {
  let recipeId: number;
  let vegetarianId: number;
  let quickMealId: number;

  beforeAll(async () => {
    const recipe = await prisma.recipe.create({
      data: {
        name: "Quick Veggie Wrap",
        description: "A fast vegetarian wrap",
        prepTime: 10,
        calories: 320,
        difficulty: "Easy",
        instructions: "Wrap veggies in tortilla.",
      },
    });
    recipeId = recipe.id;

    const vegetarian = await prisma.dietTag.findUnique({
      where: { name: "Vegetarian" },
    });
    vegetarianId = vegetarian!.id;

    const quickMeal = await prisma.dietTag.findUnique({
      where: { name: "QuickMeal" },
    });
    quickMealId = quickMeal!.id;
  });

  it("assigns multiple diet tags to a recipe", async () => {
    await prisma.recipeDietTag.createMany({
      data: [
        { recipeId, dietTagId: vegetarianId },
        { recipeId, dietTagId: quickMealId },
      ],
    });

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { dietTags: { include: { dietTag: true } } },
    });

    expect(recipe!.dietTags).toHaveLength(2);
    const tagNames = recipe!.dietTags.map((rt) => rt.dietTag.name);
    expect(tagNames).toContain("Vegetarian");
    expect(tagNames).toContain("QuickMeal");
  });

  it("prevents duplicate recipe-tag pairs", async () => {
    await expect(
      prisma.recipeDietTag.create({
        data: { recipeId, dietTagId: vegetarianId },
      })
    ).rejects.toThrow();
  });

  it("queries recipes by diet tag", async () => {
    const tag = await prisma.dietTag.findUnique({
      where: { name: "Vegetarian" },
      include: { recipes: { include: { recipe: true } } },
    });

    expect(tag!.recipes.length).toBeGreaterThanOrEqual(1);
    const recipeNames = tag!.recipes.map((rt) => rt.recipe.name);
    expect(recipeNames).toContain("Quick Veggie Wrap");
  });

  it("assigns a tag to multiple recipes", async () => {
    const recipe2 = await prisma.recipe.create({
      data: {
        name: "Lentil Soup",
        description: "Hearty lentil soup",
        prepTime: 40,
        calories: 280,
        difficulty: "Easy",
        instructions: "Simmer lentils with spices.",
      },
    });

    await prisma.recipeDietTag.create({
      data: { recipeId: recipe2.id, dietTagId: vegetarianId },
    });

    const tag = await prisma.dietTag.findUnique({
      where: { name: "Vegetarian" },
      include: { recipes: { include: { recipe: true } } },
    });

    expect(tag!.recipes.length).toBeGreaterThanOrEqual(2);
  });

  it("removes a tag from a recipe without deleting either", async () => {
    const link = await prisma.recipeDietTag.findFirst({
      where: { recipeId, dietTagId: quickMealId },
    });

    await prisma.recipeDietTag.delete({ where: { id: link!.id } });

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { dietTags: { include: { dietTag: true } } },
    });
    expect(recipe!.dietTags).toHaveLength(1);
    expect(recipe!.dietTags[0].dietTag.name).toBe("Vegetarian");

    const tagStillExists = await prisma.dietTag.findUnique({
      where: { id: quickMealId },
    });
    expect(tagStillExists).not.toBeNull();
  });

  it("creates a recipe with nested diet tag relations", async () => {
    const veganTag = await prisma.dietTag.findUnique({
      where: { name: "Vegan" },
    });
    const lowCarbTag = await prisma.dietTag.findUnique({
      where: { name: "LowCarb" },
    });

    const recipe = await prisma.recipe.create({
      data: {
        name: "Zucchini Noodles",
        description: "Low carb vegan noodles",
        prepTime: 15,
        calories: 180,
        difficulty: "Easy",
        instructions: "Spiralize zucchini, sauté with garlic.",
        dietTags: {
          create: [
            { dietTagId: veganTag!.id },
            { dietTagId: lowCarbTag!.id },
          ],
        },
      },
      include: { dietTags: { include: { dietTag: true } } },
    });

    expect(recipe.dietTags).toHaveLength(2);
    const names = recipe.dietTags.map((rt) => rt.dietTag.name);
    expect(names).toContain("Vegan");
    expect(names).toContain("LowCarb");
  });
});
