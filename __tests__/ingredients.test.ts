// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";
import {
  INGREDIENT_CATEGORIES,
  isValidCategory,
} from "../lib/ingredients";

const TEST_DB_PATH = resolve(__dirname, "../prisma/test-ingredients.db");
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

describe("isValidCategory", () => {
  it("accepts valid categories", () => {
    expect(isValidCategory("protein")).toBe(true);
    expect(isValidCategory("vegetable")).toBe(true);
    expect(isValidCategory("carb")).toBe(true);
    expect(isValidCategory("other")).toBe(true);
  });

  it("rejects invalid categories", () => {
    expect(isValidCategory("fruit")).toBe(false);
    expect(isValidCategory("")).toBe(false);
    expect(isValidCategory("Protein")).toBe(false);
  });
});

describe("INGREDIENT_CATEGORIES", () => {
  it("contains exactly four categories", () => {
    expect(INGREDIENT_CATEGORIES).toHaveLength(4);
  });

  it("contains protein, vegetable, carb, other", () => {
    expect(INGREDIENT_CATEGORIES).toContain("protein");
    expect(INGREDIENT_CATEGORIES).toContain("vegetable");
    expect(INGREDIENT_CATEGORIES).toContain("carb");
    expect(INGREDIENT_CATEGORIES).toContain("other");
  });
});

describe("Ingredient model", () => {
  it("creates an ingredient with a protein category", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Chicken Breast", category: "protein" },
    });

    expect(ingredient.id).toBeDefined();
    expect(ingredient.name).toBe("Chicken Breast");
    expect(ingredient.category).toBe("protein");
  });

  it("creates an ingredient with a vegetable category", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Broccoli", category: "vegetable" },
    });

    expect(ingredient.category).toBe("vegetable");
  });

  it("creates an ingredient with a carb category", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Rice", category: "carb" },
    });

    expect(ingredient.category).toBe("carb");
  });

  it("creates an ingredient with an other category", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Olive Oil", category: "other" },
    });

    expect(ingredient.category).toBe("other");
  });

  it("enforces unique ingredient names", async () => {
    await prisma.ingredient.create({
      data: { name: "Salmon", category: "protein" },
    });

    await expect(
      prisma.ingredient.create({
        data: { name: "Salmon", category: "protein" },
      })
    ).rejects.toThrow();
  });

  it("finds ingredients by category", async () => {
    const proteins = await prisma.ingredient.findMany({
      where: { category: "protein" },
    });

    expect(proteins.length).toBeGreaterThanOrEqual(2);
    expect(proteins.every((i) => i.category === "protein")).toBe(true);
  });

  it("finds an ingredient by name", async () => {
    const found = await prisma.ingredient.findUnique({
      where: { name: "Broccoli" },
    });

    expect(found).not.toBeNull();
    expect(found!.category).toBe("vegetable");
  });

  it("updates an ingredient category", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Tofu", category: "other" },
    });

    const updated = await prisma.ingredient.update({
      where: { id: ingredient.id },
      data: { category: "protein" },
    });

    expect(updated.category).toBe("protein");
  });

  it("deletes an ingredient", async () => {
    const ingredient = await prisma.ingredient.create({
      data: { name: "Temp Ingredient", category: "other" },
    });

    await prisma.ingredient.delete({ where: { id: ingredient.id } });

    const found = await prisma.ingredient.findUnique({
      where: { id: ingredient.id },
    });
    expect(found).toBeNull();
  });
});
