import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WeeklyPlannerPage from "@/app/weekly/page";

const mockIngredientsResponse = {
  categories: {
    protein: [{ id: 1, name: "Chicken" }, { id: 2, name: "Tofu" }],
    vegetable: [{ id: 3, name: "Broccoli" }, { id: 4, name: "Spinach" }],
    carb: [{ id: 5, name: "Rice" }],
    other: [],
  },
};

describe("Weekly planner page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the weekly planner and displays Monday through Sunday assignments", async () => {
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

      if (url === "/api/meals/weekly") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              plan: [
                { day: "Monday", name: "Chicken Rice Bowl", matchPercentage: 100, missingIngredients: [] },
                { day: "Tuesday", name: "Tofu Broccoli Bowl", matchPercentage: 90, missingIngredients: ["Spinach"] },
                { day: "Wednesday", name: "Chicken Stir Fry", matchPercentage: 80, missingIngredients: ["Soy Sauce"] },
                { day: "Thursday", name: "Tofu Rice Bowl", matchPercentage: 90, missingIngredients: [] },
                { day: "Friday", name: "Chicken Spinach Bowl", matchPercentage: 85, missingIngredients: [] },
                { day: "Saturday", name: "Tofu Quinoa Bowl", matchPercentage: 70, missingIngredients: ["Quinoa"] },
                { day: "Sunday", name: "Chicken Veggie Plate", matchPercentage: 75, missingIngredients: ["Tomato"] },
              ],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
        );
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<WeeklyPlannerPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Chicken" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Chicken" }));
    fireEvent.click(screen.getByRole("button", { name: /generate weekly plan/i }));

    await waitFor(() => expect(screen.getAllByText(/monday/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/tuesday/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wednesday/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/thursday/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/friday/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/saturday/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sunday/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Chicken Rice Bowl")).toBeInTheDocument();
  });

  it("shows a loading state while the weekly plan is being generated", async () => {
    let resolveWeekly: (value: Response) => void;
    const weeklyPromise = new Promise<Response>((resolve) => {
      resolveWeekly = resolve;
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

      if (url === "/api/meals/weekly") {
        return weeklyPromise;
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<WeeklyPlannerPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Chicken" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Chicken" }));
    fireEvent.click(screen.getByRole("button", { name: /generate weekly plan/i }));

    expect(screen.getByRole("button", { name: /planning.../i })).toBeInTheDocument();

    resolveWeekly(
      new Response(
        JSON.stringify({
          plan: [
            { day: "Monday", name: "Chicken Rice Bowl", matchPercentage: 100, missingIngredients: [] },
            { day: "Tuesday", name: "Tofu Bowl", matchPercentage: 90, missingIngredients: [] },
            { day: "Wednesday", name: "Chicken Veggie Plate", matchPercentage: 80, missingIngredients: [] },
            { day: "Thursday", name: "Tofu Rice Bowl", matchPercentage: 90, missingIngredients: [] },
            { day: "Friday", name: "Chicken Stir Fry", matchPercentage: 85, missingIngredients: [] },
            { day: "Saturday", name: "Tofu Quinoa Bowl", matchPercentage: 70, missingIngredients: [] },
            { day: "Sunday", name: "Chicken Plate", matchPercentage: 75, missingIngredients: [] },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    await waitFor(() => expect(screen.getByText("Chicken Rice Bowl")).toBeInTheDocument());
  });

  it("shows an error message if the weekly plan request fails", async () => {
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

      if (url === "/api/meals/weekly") {
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Weekly planning failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        );
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<WeeklyPlannerPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Chicken" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Chicken" }));
    fireEvent.click(screen.getByRole("button", { name: /generate weekly plan/i }));

    await waitFor(() => expect(screen.getByText(/weekly planning failed/i)).toBeInTheDocument());
  });
});
