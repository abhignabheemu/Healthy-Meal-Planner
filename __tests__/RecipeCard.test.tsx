import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecipeCard } from "@/app/components/RecipeCard";

describe("RecipeCard", () => {
  it("renders match score, missing ingredients, calories, prep time and difficulty", () => {
    render(
      <RecipeCard
        recipe={{
          id: "1",
          name: "Chicken Rice Bowl",
          matchPercentage: 100,
          missingIngredients: ["Soy Sauce"],
          calories: 450,
          prepTime: 20,
          difficulty: "Easy",
        }}
      />
    );

    expect(screen.getByText("Chicken Rice Bowl")).toBeInTheDocument();
    expect(screen.getByText("100% match")).toBeInTheDocument();
    expect(screen.getByText("Missing ingredients")).toBeInTheDocument();
    expect(screen.getByText("Soy Sauce")).toBeInTheDocument();
    expect(screen.getByText("450 kcal")).toBeInTheDocument();
    expect(screen.getByText("20 min")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });
});
