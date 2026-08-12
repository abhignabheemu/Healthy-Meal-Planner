"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IngredientSelector, type CategorizedIngredients } from "@/app/components/IngredientSelector";
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

interface PlanEntry {
  day: string;
  name: string;
  matchPercentage: number;
  missingIngredients: string[];
}

export default function WeeklyPlannerPage() {
  const [categories, setCategories] = useState<CategorizedIngredients>(EMPTY_CATEGORIES);
  const [selected, setSelected] = useState<number[]>([]);
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanEntry[]>([]);

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
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  }

  async function generateWeeklyPlan() {
    if (selectedIngredientNames.length === 0) {
      setError("Please choose at least one ingredient before generating a weekly plan.");
      return;
    }

    setLoading(true);
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

      setPlan(data.plan ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate weekly meal plan");
      setPlan([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-4 py-10 text-gray-800">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-3 rounded-2xl bg-emerald-700 px-6 py-6 text-white shadow-lg">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Weekly planner</p>
            <h1 className="mt-2 text-3xl font-bold">Monday to Sunday</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-emerald-200 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Back home
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Select kitchen ingredients</h2>
              {selected.length > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
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
                          ? "border-emerald-600 bg-emerald-100 text-emerald-800"
                          : "border-gray-300 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={generateWeeklyPlan}
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {loading ? "Planning..." : "Generate Weekly Plan"}
              </button>
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">Selected ingredients</h2>
            <div className="mt-4 flex flex-wrap gap-2">
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

            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Planner summary</p>
              <p className="mt-2 text-sm text-emerald-700">
                {plan.length > 0
                  ? `${plan.length} meals scheduled for the week.`
                  : "Generate a plan to see your weekly assignments."}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Weekly assignments</h2>
            {plan.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                {plan.length} meals
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-sm text-emerald-700">
              Building your weekly meal plan...
            </div>
          ) : plan.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plan.map((entry) => (
                <article
                  key={entry.day}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{entry.day}</h3>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-800">
                      {entry.matchPercentage}%
                    </span>
                  </div>

                  <p className="mt-3 text-base font-semibold text-gray-900">{entry.name}</p>

                  {entry.missingIngredients.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Missing ingredients
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.missingIngredients.map((ingredient) => (
                          <span
                            key={`${entry.day}-${ingredient}`}
                            className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-emerald-700">No ingredients missing.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
              Your weekly schedule will appear here once you generate a plan.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
