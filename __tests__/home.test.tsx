import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

const mockIngredientsResponse = {
  categories: {
    protein: [{ id: 1, name: "Chicken" }, { id: 2, name: "Tofu" }],
    vegetable: [{ id: 3, name: "Broccoli" }],
    carb: [{ id: 4, name: "Rice" }],
    other: [],
  },
};

describe("Home page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Healthy Meal Planner heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /healthy meal planner/i })
    ).toBeInTheDocument();
  });

  it("shows the ingredient selector and action buttons", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockIngredientsResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(<Home />);
    await waitFor(() => expect(screen.getByText(/select ingredients/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /generate meals/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate weekly plan/i })
    ).toBeInTheDocument();
  });

  it("shows a loading state and then the recommendation results", async () => {
    let resolveRecommendation: (value: Response) => void;
    const recommendationPromise = new Promise<Response>((resolve) => {
      resolveRecommendation = resolve;
    });

    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/ingredients") {
        return Promise.resolve(
          new Response(JSON.stringify(mockIngredientsResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      if (url === "/api/meals/recommend") {
        return recommendationPromise;
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<Home />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Chicken" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Chicken" }));
    fireEvent.click(screen.getByRole("button", { name: /generate meals/i }));

    expect(screen.getByRole("button", { name: /generating.../i })).toBeInTheDocument();

    resolveRecommendation(
      new Response(
        JSON.stringify({
          results: [{ id: "1", name: "Chicken Rice Bowl", matchPercentage: 100, missingIngredients: [] }],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    await waitFor(() => expect(screen.getByText("Chicken Rice Bowl")).toBeInTheDocument());
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it("shows an error message when the recommendation API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/ingredients") {
        return Promise.resolve(
          new Response(JSON.stringify(mockIngredientsResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      if (url === "/api/meals/recommend") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Recommendation failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<Home />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Chicken" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Chicken" }));
    fireEvent.click(screen.getByRole("button", { name: /generate meals/i }));

    await waitFor(() => expect(screen.getByText(/recommendation failed/i)).toBeInTheDocument());
  });
});
