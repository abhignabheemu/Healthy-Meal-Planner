// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_DB_PATH = resolve(__dirname, "../prisma/recommend-test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

let prisma: InstanceType<typeof PrismaClient>;

async function callRecommend(body: unknown) {
  const { POST } = await import("../app/api/meals/recommend/route");
  const request = new Request("http://localhost/api/meals/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const { NextRequest } = await import("next/server");
  const nextReq = new NextRequest(request);
  return POST(nextReq);
}

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

  const chicken = await prisma.ingredient.create({ data: { name: "Chicken", category: "protein" } });
  const rice = await prisma.ingredient.create({ data: { name: "Rice", category: "carb" } });
  const broccoli = await prisma.ingredient.create({ data: { name: "Broccoli", category: "vegetable" } });
  const tofu = await prisma.ingredient.create({ data: { name: "Tofu", category: "protein" } });
  const soySauce = await prisma.ingredient.create({ data: { name: "Soy Sauce", category: "other" } });
  const garlic = await prisma.ingredient.create({ data: { name: "Garlic", category: "vegetable" } });

  const r1 = await prisma.recipe.create({
    data: {
      name: "Chicken Rice Bowl",
      description: "Simple chicken and rice",
      prepTime: 20,
      calories: 450,
      difficulty: "Easy",
      instructions: "Cook chicken, serve over rice",
    },
  });
  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: r1.id, ingredientId: chicken.id, required: true },
      { recipeId: r1.id, ingredientId: rice.id, required: true },
    ],
  });

  const r2 = await prisma.recipe.create({
    data: {
      name: "Chicken Stir Fry",
      description: "Chicken with veggies",
      prepTime: 30,
      calories: 500,
      difficulty: "Medium",
      instructions: "Stir fry chicken with broccoli",
    },
  });
  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: r2.id, ingredientId: chicken.id, required: true },
      { recipeId: r2.id, ingredientId: broccoli.id, required: true },
      { recipeId: r2.id, ingredientId: soySauce.id, required: true },
    ],
  });

  const r3 = await prisma.recipe.create({
    data: {
      name: "Tofu Bowl",
      description: "Vegan tofu rice bowl",
      prepTime: 15,
      calories: 350,
      difficulty: "Easy",
      instructions: "Cook tofu, serve over rice",
    },
  });
  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: r3.id, ingredientId: tofu.id, required: true },
      { recipeId: r3.id, ingredientId: rice.id, required: true },
      { recipeId: r3.id, ingredientId: soySauce.id, required: true },
    ],
  });

  const r4 = await prisma.recipe.create({
    data: {
      name: "Impossible Dish",
      description: "Requires everything",
      prepTime: 60,
      calories: 800,
      difficulty: "Hard",
      instructions: "Good luck",
    },
  });
  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: r4.id, ingredientId: chicken.id, required: true },
      { recipeId: r4.id, ingredientId: rice.id, required: true },
      { recipeId: r4.id, ingredientId: broccoli.id, required: true },
      { recipeId: r4.id, ingredientId: tofu.id, required: true },
      { recipeId: r4.id, ingredientId: soySauce.id, required: true },
      { recipeId: r4.id, ingredientId: garlic.id, required: true },
    ],
  });

  const veganTag = await prisma.dietTag.create({ data: { name: "Vegan" } });
  await prisma.recipeDietTag.create({ data: { recipeId: r3.id, dietTagId: veganTag.id } });
});

afterAll(async () => {
  await prisma.$disconnect();
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
});

describe("POST /api/meals/recommend", () => {
  describe("validation", () => {
    it("returns 400 for invalid JSON", async () => {
      const { POST } = await import("../app/api/meals/recommend/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest(new Request("http://localhost/api/meals/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      }));
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid JSON");
    });

    it("returns 400 when ingredients is missing", async () => {
      const res = await callRecommend({});
      expect(res.status).toBe(400);
    });

    it("returns 400 when ingredients is empty", async () => {
      const res = await callRecommend({ ingredients: [] });
      expect(res.status).toBe(400);
    });

    it("returns 400 when ingredients contains non-strings", async () => {
      const res = await callRecommend({ ingredients: [123, null] });
      expect(res.status).toBe(400);
    });

    it("returns 400 when ingredients contains empty strings", async () => {
      const res = await callRecommend({ ingredients: ["", "  "] });
      expect(res.status).toBe(400);
    });

    it("returns 400 when dietTags is not an array", async () => {
      const res = await callRecommend({ ingredients: ["Chicken"], dietTags: "Vegan" });
      expect(res.status).toBe(400);
    });
  });

  describe("matching", () => {
    it("returns exact matches with 100% score", async () => {
      const res = await callRecommend({ ingredients: ["Chicken", "Rice"] });
      expect(res.status).toBe(200);
      const data = await res.json();
      const bowl = data.results.find((r: { name: string }) => r.name === "Chicken Rice Bowl");
      expect(bowl).toBeDefined();
      expect(bowl.matchPercentage).toBe(100);
      expect(bowl.missingIngredients).toEqual([]);
    });

    it("returns partial matches with missing ingredients listed", async () => {
      const res = await callRecommend({ ingredients: ["Chicken", "Rice"] });
      const data = await res.json();
      const stirFry = data.results.find((r: { name: string }) => r.name === "Chicken Stir Fry");
      expect(stirFry).toBeDefined();
      expect(stirFry.matchPercentage).toBe(80);
      expect(stirFry.missingIngredients).toContain("Broccoli");
      expect(stirFry.missingIngredients).toContain("Soy Sauce");
    });

    it("hides recipes with 3+ missing ingredients", async () => {
      const res = await callRecommend({ ingredients: ["Chicken", "Rice"] });
      const data = await res.json();
      const names = data.results.map((r: { name: string }) => r.name);
      expect(names).not.toContain("Impossible Dish");
    });

    it("ranks results by match percentage descending", async () => {
      const res = await callRecommend({ ingredients: ["Chicken", "Rice"] });
      const data = await res.json();
      for (let i = 1; i < data.results.length; i++) {
        expect(data.results[i - 1].matchPercentage).toBeGreaterThanOrEqual(
          data.results[i].matchPercentage
        );
      }
    });

    it("includes recipe metadata in response", async () => {
      const res = await callRecommend({ ingredients: ["Chicken", "Rice"] });
      const data = await res.json();
      const bowl = data.results.find((r: { name: string }) => r.name === "Chicken Rice Bowl");
      expect(bowl.calories).toBe(450);
      expect(bowl.prepTime).toBe(20);
      expect(bowl.difficulty).toBe("Easy");
      expect(bowl.id).toBeDefined();
    });
  });

  describe("dietary filtering", () => {
    it("filters recipes by diet tag", async () => {
      const res = await callRecommend({
        ingredients: ["Tofu", "Rice", "Soy Sauce"],
        dietTags: ["Vegan"],
      });
      const data = await res.json();
      const names = data.results.map((r: { name: string }) => r.name);
      expect(names).toContain("Tofu Bowl");
      expect(names).not.toContain("Chicken Rice Bowl");
      expect(names).not.toContain("Chicken Stir Fry");
    });

    it("returns all recipes when no dietTags provided", async () => {
      const res = await callRecommend({ ingredients: ["Chicken", "Rice", "Tofu", "Soy Sauce"] });
      const data = await res.json();
      expect(data.results.length).toBeGreaterThanOrEqual(3);
    });

    it("returns empty results when no tagged recipes match available ingredients", async () => {
      const res = await callRecommend({
        ingredients: ["Garlic"],
        dietTags: ["Vegan"],
      });
      const data = await res.json();
      expect(data.results).toEqual([]);
    });
  });
});
