import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the Healthy Meal Planner heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /healthy meal planner/i })
    ).toBeInTheDocument();
  });
});
