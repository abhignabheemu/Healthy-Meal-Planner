"use client";

import { useEffect, useMemo, useState } from "react";
import { IngredientSelector, type CategorizedIngredients } from "@/app/components/IngredientSelector";
import { RecipeCard } from "@/app/components/RecipeCard";
import { INGREDIENT_CATEGORIES } from "@/lib/ingredients";

const EMPTY_CATEGORIES: CategorizedIngredients = {
  protein: [],
  vegetable: [],
  carb: [],
  other: [],
};

const DIET_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "HighProtein",
  "LowCarb",
  "QuickMeal",
] as const;

interface MealResult {
  id: string | number;
  name: string;
  matchPercentage: number;
  missingIngredients: string[];
  calories?: number;
  prepTime?: number;
  difficulty?: string;
}

interface PlanEntry {
  day: string;
  name: string;
  matchPercentage: number;
  missingIngredients: string[];
}

export default function Home() {
  const [categories, setCategories] = useState<CategorizedIngredients>(EMPTY_CATEGORIES);
  const [selected, setSelected] = useState<number[]>([]);
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<MealResult[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<PlanEntry[]>([]);

  useEffect(() => {
    async function loadIngredients() {
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) {
          throw new Error("Unable to load ingredients");
        }
        const data = await response.json();
        setCategories(data.categories ?? EMPTY_CATEGORIES);
      } catch {
        setCategories(EMPTY_CATEGORIES);
      }
    }

    loadIngredients();
  }, []);

  const selectedIngredientNames = useMemo(() => {
    const names = new Set<string>();
    for (const category of INGREDIENT_CATEGORIES) {
      for (const ingredient of categories[category]) {
        if (selected.includes(ingredient.id)) {
          names.add(ingredient.name);
        }
      }
    }
    return Array.from(names);
  }, [categories, selected]);

  function toggleDietTag(tag: string) {
    setDietTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  }

  async function generateMeals() {
    if (selectedIngredientNames.length === 0) {
      setError("Please choose at least one ingredient before generating meals.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/meals/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedIngredientNames,
          dietTags,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to generate meal recommendations");
      }

      setResults(data.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate meal recommendations");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function generateWeeklyPlan() {
    if (selectedIngredientNames.length === 0) {
      setError("Please choose at least one ingredient before generating a weekly plan.");
      return;
    }

    setWeeklyLoading(true);
    setError("");

    try {
      const response = await fetch("/api/meals/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedIngredientNames,
          dietTags,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to generate weekly meal plan");
      }

      setWeeklyPlan(data.plan ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate weekly meal plan");
      setWeeklyPlan([]);
    } finally {
      setWeeklyLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl bg-green-700 px-6 py-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-green-100">Meal planning</p>
          <h1 className="mt-3 text-4xl font-bold">Healthy Meal Planner</h1>
          <p className="mt-3 max-w-2xl text-base text-green-50">
            Plan healthy meals based on the ingredients you already have at home.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Select Ingredients</h2>
              {selected.length > 0 && (
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                  {selected.length} selected
                </span>
              )}
            </div>

            <IngredientSelector
              categories={categories}
              selected={selected}
              onChange={setSelected}
            />

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                Dietary preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((tag) => {
                  const active = dietTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "border-green-600 bg-green-100 text-green-800"
                          : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generateMeals}
                disabled={loading}
                className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                {loading ? "Generating..." : "Generate Meals"}
              </button>
              <button
                type="button"
                onClick={generateWeeklyPlan}
                disabled={weeklyLoading}
                className="flex-1 rounded-lg border border-green-600 bg-white px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {weeklyLoading ? "Planning..." : "Generate Weekly Plan"}
              </button>
            </div>

            <div className="mt-3 text-right">
              <a
                href="/weekly"
                className="text-sm font-medium text-green-700 underline decoration-green-500 underline-offset-4 hover:text-green-800"
              >
                Open weekly planner
              </a>
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </section>

          <aside className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Selected ingredients</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedIngredientNames.length > 0 ? (
                  selectedIngredientNames.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {ingredient}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No ingredients selected yet.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">Meal matches</h3>
              <div className="mt-3 space-y-3">
                {results.length > 0 ? (
                  results.slice(0, 3).map((recipe) => (
                    <RecipeCard
                      key={String(recipe.id)}
                      recipe={{
                        id: recipe.id,
                        name: recipe.name,
                        matchPercentage: recipe.matchPercentage,
                        missingIngredients: recipe.missingIngredients,
                        calories: recipe.calories,
                        prepTime: recipe.prepTime,
                        difficulty: recipe.difficulty,
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {weeklyPlan.length > 0 && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Weekly Plan</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {weeklyPlan.map((entry) => (
                <div key={entry.day} className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{entry.day}</h3>
                    <span className="text-xs font-semibold text-green-700">
                      {entry.matchPercentage}%
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-gray-900">{entry.name}</p>
                  {entry.missingIngredients.length > 0 && (
                    <p className="mt-2 text-xs text-gray-600">
                      Missing: {entry.missingIngredients.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
