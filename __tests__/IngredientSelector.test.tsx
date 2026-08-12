import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import {
  IngredientSelector,
  type CategorizedIngredients,
} from "@/app/components/IngredientSelector";

const mockCategories: CategorizedIngredients = {
  protein: [
    { id: 1, name: "Chicken" },
    { id: 2, name: "Salmon" },
    { id: 3, name: "Tofu" },
  ],
  vegetable: [
    { id: 4, name: "Broccoli" },
    { id: 5, name: "Spinach" },
  ],
  carb: [{ id: 6, name: "Rice" }],
  other: [],
};

describe("IngredientSelector", () => {
  it("renders category groups with ingredient buttons", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.getByText("Vegetables")).toBeInTheDocument();
    expect(screen.getByText("Carbs")).toBeInTheDocument();
    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(screen.getByText("Broccoli")).toBeInTheDocument();
    expect(screen.getByText("Rice")).toBeInTheDocument();
  });

  it("does not render empty categories", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("calls onChange with ingredient id when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Chicken"));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("deselects an ingredient when clicked again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[1, 4]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Chicken"));
    expect(onChange).toHaveBeenCalledWith([4]);
  });

  it("marks selected ingredients with aria-pressed", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[2, 5]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Salmon")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Spinach")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("Chicken")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("selects all ingredients in a category via Select All", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[1]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByLabelText("Select all Protein"));
    expect(onChange).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("deselects all in category when all are already selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[1, 2, 3, 4]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByLabelText("Select all Protein"));
    expect(onChange).toHaveBeenCalledWith([4]);
  });

  it("collapses and expands a category group", async () => {
    const user = userEvent.setup();

    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Chicken")).toBeVisible();

    await user.click(screen.getByText("Protein"));
    expect(screen.queryByText("Chicken")).not.toBeInTheDocument();

    await user.click(screen.getByText("Protein"));
    expect(screen.getByText("Chicken")).toBeVisible();
  });

  it("shows selected count per category", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[1, 3]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("(2/3)")).toBeInTheDocument();
  });

  it("shows clear all button when items are selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[1, 4, 6]}
        onChange={onChange}
      />
    );

    const clearButton = screen.getByText("Clear all (3)");
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("hides clear all button when nothing is selected", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.queryByText(/clear all/i)).not.toBeInTheDocument();
  });

  it("supports multiselect across categories", async () => {
    const user = userEvent.setup();
    const selections: number[][] = [];
    const onChange = (s: number[]) => selections.push(s);

    const { rerender } = render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Chicken"));

    rerender(
      <IngredientSelector
        categories={mockCategories}
        selected={selections[0]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Broccoli"));

    expect(selections[0]).toEqual([1]);
    expect(selections[1]).toEqual([1, 4]);
  });
});

describe("IngredientSelector autocomplete search", () => {
  it("renders a search input with combobox role", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox", { name: /search ingredients/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-controls", "ingredient-listbox");
  });

  it("does not show dropdown when input is empty", () => {
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows matching suggestions when typing", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "chi");

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Chicken");
  });

  it("filters case-insensitively", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "SALM");

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Salmon");
  });

  it("hides dropdown when no matches found", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "xyz");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters category pills when searching", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "Salmon");

    expect(screen.getByRole("button", { name: "Salmon" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chicken" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tofu" })).not.toBeInTheDocument();
  });

  it("hides categories with no matching pills", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "Salmon");

    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.queryByText("Vegetables")).not.toBeInTheDocument();
    expect(screen.queryByText("Carbs")).not.toBeInTheDocument();
  });

  it("restores all pills when search is cleared", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "Salmon");
    expect(screen.queryByRole("button", { name: "Chicken" })).not.toBeInTheDocument();

    await user.clear(input);
    expect(screen.getByRole("button", { name: "Chicken" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salmon" })).toBeInTheDocument();
  });

  it("toggles ingredient when clicking a suggestion", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={onChange}
      />
    );

    await user.type(screen.getByRole("combobox"), "chi");
    const options = screen.getAllByRole("option");
    await user.click(options[0]);

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("shows checkmark for already-selected ingredients in suggestions", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[1]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "chi");

    const options = screen.getAllByRole("option");
    expect(within(options[0]).getByText("✓")).toBeInTheDocument();
  });

  it("navigates suggestions with ArrowDown", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "c");
    await user.keyboard("{ArrowDown}");

    expect(input).toHaveAttribute("aria-activedescendant");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("navigates suggestions with ArrowUp and wraps around", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "c");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");

    const options = screen.getAllByRole("option");
    expect(options[options.length - 1]).toHaveAttribute("aria-selected", "true");
  });

  it("wraps from last to first with ArrowDown", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "Chicken");

    // Only one match — pressing down twice should wrap
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("selects highlighted suggestion on Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "Chicken");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("closes dropdown on Escape", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox");
    await user.type(input, "chi");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("updates aria-expanded when dropdown opens and closes", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.type(input, "chi");
    expect(input).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("highlights matching text in suggestions", async () => {
    const user = userEvent.setup();
    render(
      <IngredientSelector
        categories={mockCategories}
        selected={[]}
        onChange={() => {}}
      />
    );

    await user.type(screen.getByRole("combobox"), "chi");

    const options = screen.getAllByRole("option");
    const boldSpan = options[0].querySelector("span.font-bold");
    expect(boldSpan).toBeInTheDocument();
    expect(boldSpan?.textContent?.toLowerCase()).toBe("chi");
  });
});
