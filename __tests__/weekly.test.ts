// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_DB_PATH = resolve(__dirname, "../prisma/weekly-test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

let prisma: InstanceType<typeof PrismaClient>;

async function callWeekly(body: unknown) {
  const { POST } = await import("../app/api/meals/weekly/route");
  const request = new Request("http://localhost/api/meals/weekly", {
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
  const tofu = await prisma.ingredient.create({ data: { name: "Tofu", category: "protein" } });
  const rice = await prisma.ingredient.create({ data: { name: "Rice", category: "carb" } });
  const broccoli = await prisma.ingredient.create({ data: { name: "Broccoli", category: "vegetable" } });
  const spinach = await prisma.ingredient.create({ data: { name: "Spinach", category: "vegetable" } });
  const carrots = await prisma.ingredient.create({ data: { name: "Carrots", category: "vegetable" } });
  const quinoa = await prisma.ingredient.create({ data: { name: "Quinoa", category: "carb" } });
  const salmon = await prisma.ingredient.create({ data: { name: "Salmon", category: "protein" } });

  const meals = [
    {
      name: "Chicken Rice Bowl",
      description: "Chicken rice bowl",
      prepTime: 20,
      calories: 450,
      difficulty: "Easy",
      instructions: "Cook chicken and serve with rice",
      ingredients: ["Chicken", "Rice", "Broccoli"],
    },
    {
      name: "Tofu Quinoa Power Bowl",
      description: "Vegan quinoa bowl",
      prepTime: 15,
      calories: 380,
      difficulty: "Easy",
      instructions: "Cook tofu and quinoa",
      ingredients: ["Tofu", "Quinoa", "Spinach"],
    },
    {
      name: "Salmon Veggie Plate",
      description: "Salmon with veggies",
      prepTime: 25,
      calories: 520,
      difficulty: "Medium",
      instructions: "Bake salmon and roast vegetables",
      ingredients: ["Salmon", "Broccoli", "Carrots"],
    },
    {
      name: "Chicken Spinach Stir Fry",
      description: "Quick chicken stir fry",
      prepTime: 18,
      calories: 430,
      difficulty: "Easy",
      instructions: "Stir fry chicken and spinach",
      ingredients: ["Chicken", "Spinach"],
    },
    {
      name: "Tofu Rice Bowl",
      description: "High protein tofu bowl",
      prepTime: 17,
      calories: 360,
      difficulty: "Easy",
      instructions: "Sauté tofu and serve with rice",
      ingredients: ["Tofu", "Rice"],
    },
    {
      name: "Salmon Quinoa Salad",
      description: "Salmon and quinoa salad",
      prepTime: 20,
      calories: 500,
      difficulty: "Easy",
      instructions: "Prepare salmon and quinoa salad",
      ingredients: ["Salmon", "Quinoa", "Spinach"],
    },
    {
      name: "Chicken Veggie Wrap",
      description: "Chicken wrap with greens",
      prepTime: 15,
      calories: 410,
      difficulty: "Easy",
      instructions: "Wrap chicken and vegetables",
      ingredients: ["Chicken", "Carrots", "Spinach"],
    },
  ];

  for (const meal of meals) {
    const recipe = await prisma.recipe.create({
      data: {
        name: meal.name,
        description: meal.description,
        prepTime: meal.prepTime,
        calories: meal.calories,
        difficulty: meal.difficulty,
        instructions: meal.instructions,
      },
    });

    for (const ingredientName of meal.ingredients) {
      const ingredient = await prisma.ingredient.upsert({
        where: { name: ingredientName },
        update: {},
        create: { name: ingredientName, category: ingredientName === "Chicken" || ingredientName === "Tofu" || ingredientName === "Salmon" ? "protein" : ingredientName === "Rice" || ingredientName === "Quinoa" ? "carb" : "vegetable" },
      });

      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          required: true,
        },
      });
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
});

describe("POST /api/meals/weekly", () => {
  it("returns seven unique meals for the week", async () => {
    const res = await callWeekly({ ingredients: ["Chicken", "Rice", "Broccoli", "Tofu", "Spinach", "Carrots", "Quinoa", "Salmon"], dietTags: [] });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.plan).toHaveLength(7);
    const names = data.plan.map((entry: { name: string }) => entry.name);
    expect(new Set(names).size).toBe(7);
    expect(data.plan.map((entry: { day: string }) => entry.day)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });

  it("avoids repeating the same protein on consecutive days", async () => {
    const res = await callWeekly({ ingredients: ["Chicken", "Rice", "Broccoli", "Tofu", "Spinach", "Carrots", "Quinoa", "Salmon"], dietTags: [] });
    expect(res.status).toBe(200);
    const data = await res.json();

    const proteinForMeal = (name: string) => {
      if (name.includes("Chicken")) return "Chicken";
      if (name.includes("Tofu")) return "Tofu";
      if (name.includes("Salmon")) return "Salmon";
      return "Other";
    };

    for (let i = 1; i < data.plan.length; i += 1) {
      expect(proteinForMeal(data.plan[i - 1].name)).not.toBe(proteinForMeal(data.plan[i].name));
    }
  });
});
