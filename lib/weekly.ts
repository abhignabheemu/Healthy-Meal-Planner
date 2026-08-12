export interface WeeklyCandidate {
  id: string;
  name: string;
  requiredIngredients: string[];
  matchPercentage: number;
  missingIngredients: string[];
}

export interface WeeklyPlanEntry {
  day: string;
  name: string;
  matchPercentage: number;
  missingIngredients: string[];
}

const PROTEIN_KEYWORDS = [
  "chicken",
  "tofu",
  "salmon",
  "fish",
  "egg",
  "eggs",
  "beans",
  "lentils",
  "turkey",
  "shrimp",
  "beef",
  "pork",
  "tempeh",
];

function normalizeIngredient(value: string) {
  return value.trim().toLowerCase();
}

export function inferPrimaryProtein(ingredients: string[]): string {
  const normalized = ingredients.map(normalizeIngredient);

  for (const keyword of PROTEIN_KEYWORDS) {
    if (normalized.some((ingredient) => ingredient.includes(keyword))) {
      const match = ingredients.find((ingredient) =>
        ingredient.toLowerCase().includes(keyword)
      );
      return match ?? keyword;
    }
  }

  return "Other";
}

export function buildWeeklyPlan(candidates: WeeklyCandidate[], days = 7): WeeklyPlanEntry[] {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const selected: WeeklyCandidate[] = [];
  const usedNames = new Set<string>();
  const ingredientPool = new Set<string>();

  for (let dayIndex = 0; dayIndex < Math.min(days, dayNames.length); dayIndex += 1) {
    let bestCandidate: WeeklyCandidate | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of candidates) {
      if (usedNames.has(candidate.name)) continue;

      const currentProtein = inferPrimaryProtein(candidate.requiredIngredients);
      const previousProtein = selected.length > 0
        ? inferPrimaryProtein(selected[selected.length - 1].requiredIngredients)
        : null;

      if (previousProtein && currentProtein === previousProtein) {
        continue;
      }

      const repeatedProteinCount = selected.filter(
        (item) => inferPrimaryProtein(item.requiredIngredients) === currentProtein
      ).length;

      const overlapCount = candidate.requiredIngredients.filter((ingredient) =>
        ingredientPool.has(normalizeIngredient(ingredient))
      ).length;

      const score =
        candidate.matchPercentage * 10 +
        overlapCount * 25 +
        (candidate.missingIngredients.length === 0 ? 15 : 0) -
        repeatedProteinCount * 12 -
        candidate.missingIngredients.length * 3;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate) break;

    selected.push(bestCandidate);
    usedNames.add(bestCandidate.name);
    for (const ingredient of bestCandidate.requiredIngredients) {
      ingredientPool.add(normalizeIngredient(ingredient));
    }
  }

  return selected.map((item, index) => ({
    day: dayNames[index],
    name: item.name,
    matchPercentage: item.matchPercentage,
    missingIngredients: item.missingIngredients,
  }));
}
