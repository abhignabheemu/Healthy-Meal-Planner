import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

vi.mock("@/lib/db", () => ({
  prisma: {
    recipe: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          name: "Chicken Bowl",
          calories: 420,
          prepTime: 20,
          difficulty: "Easy",
          ingredients: [{ required: true, ingredient: { name: "Chicken" } }],
          dietTags: [],
        },
      ]),
    },
  },
}));

describe("Production hardening and UX safeguards", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the home page with a direct link to the weekly planner", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          categories: {
            protein: [{ id: 1, name: "Chicken" }],
            vegetable: [],
            carb: [],
            other: [],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /healthy meal planner/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /open weekly planner/i })).toHaveAttribute(
      "href",
      "/weekly"
    );
  });

  it("normalizes duplicate ingredient entries before recommendation scoring", async () => {
    const { POST } = await import("@/app/api/meals/recommend/route");
    const { NextRequest } = await import("next/server");

    const request = new Request("http://localhost/api/meals/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: ["Chicken", "Chicken", " chicken "] }),
    });

    const response = await POST(new NextRequest(request));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.results).toHaveLength(1);
    expect(payload.results[0].name).toBe("Chicken Bowl");
    expect(payload.results[0].matchPercentage).toBe(100);
  });
});
