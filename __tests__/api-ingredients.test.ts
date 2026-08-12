// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_DB_PATH = resolve(__dirname, "../prisma/test-api-ingredients.db");
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

  await prisma.ingredient.createMany({
    data: [
      { name: "Chicken Breast", category: "protein" },
      { name: "Salmon", category: "protein" },
      { name: "Tofu", category: "protein" },
      { name: "Broccoli", category: "vegetable" },
      { name: "Spinach", category: "vegetable" },
      { name: "Rice", category: "carb" },
      { name: "Pasta", category: "carb" },
      { name: "Olive Oil", category: "other" },
      { name: "Soy Sauce", category: "other" },
    ],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
});

async function callGET() {
  const { GET } = await import("../app/api/ingredients/route");
  const response = await GET();
  return { status: response.status, body: await response.json() };
}

describe("GET /api/ingredients", () => {
  it("returns 200 with categorized ingredients", async () => {
    const { status, body } = await callGET();

    expect(status).toBe(200);
    expect(body).toHaveProperty("categories");
    expect(body.categories).toHaveProperty("protein");
    expect(body.categories).toHaveProperty("vegetable");
    expect(body.categories).toHaveProperty("carb");
    expect(body.categories).toHaveProperty("other");
  });

  it("groups protein ingredients correctly", async () => {
    const { body } = await callGET();
    const names = body.categories.protein.map((i: { name: string }) => i.name);

    expect(names).toContain("Chicken Breast");
    expect(names).toContain("Salmon");
    expect(names).toContain("Tofu");
  });

  it("groups vegetable ingredients correctly", async () => {
    const { body } = await callGET();
    const names = body.categories.vegetable.map((i: { name: string }) => i.name);

    expect(names).toContain("Broccoli");
    expect(names).toContain("Spinach");
  });

  it("groups carb ingredients correctly", async () => {
    const { body } = await callGET();
    const names = body.categories.carb.map((i: { name: string }) => i.name);

    expect(names).toContain("Rice");
    expect(names).toContain("Pasta");
  });

  it("groups other ingredients correctly", async () => {
    const { body } = await callGET();
    const names = body.categories.other.map((i: { name: string }) => i.name);

    expect(names).toContain("Olive Oil");
    expect(names).toContain("Soy Sauce");
  });

  it("returns ingredients sorted alphabetically within categories", async () => {
    const { body } = await callGET();
    const proteins = body.categories.protein.map((i: { name: string }) => i.name);

    const sorted = [...proteins].sort();
    expect(proteins).toEqual(sorted);
  });

  it("returns id and name for each ingredient", async () => {
    const { body } = await callGET();
    const firstProtein = body.categories.protein[0];

    expect(firstProtein).toHaveProperty("id");
    expect(firstProtein).toHaveProperty("name");
    expect(typeof firstProtein.id).toBe("number");
    expect(typeof firstProtein.name).toBe("string");
  });

  it("returns empty arrays for categories with no ingredients", async () => {
    await prisma.ingredient.deleteMany({ where: { category: "carb" } });

    const { body } = await callGET();
    expect(body.categories.carb).toEqual([]);

    await prisma.ingredient.createMany({
      data: [
        { name: "Rice", category: "carb" },
        { name: "Pasta", category: "carb" },
      ],
    });
  });
});
