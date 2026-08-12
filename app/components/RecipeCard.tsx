export interface RecipeCardProps {
  recipe: {
    id: string | number;
    name: string;
    matchPercentage: number;
    missingIngredients: string[];
    calories?: number;
    prepTime?: number;
    difficulty?: string;
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
        </div>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
          {recipe.matchPercentage}% match
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Calories
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {recipe.calories ?? 0} kcal
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Prep time
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {recipe.prepTime ?? 0} min
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Difficulty
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800">{recipe.difficulty ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Missing ingredients
        </p>
        {recipe.missingIngredients.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {recipe.missingIngredients.map((ingredient) => (
              <span
                key={`${recipe.id}-${ingredient}`}
                className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
              >
                {ingredient}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-green-700">No ingredients missing.</p>
        )}
      </div>
    </article>
  );
}
