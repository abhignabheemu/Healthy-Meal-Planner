"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { type IngredientCategory, INGREDIENT_CATEGORIES } from "@/lib/ingredients";

export interface Ingredient {
  id: number;
  name: string;
}

export type CategorizedIngredients = Record<IngredientCategory, Ingredient[]>;

interface IngredientSelectorProps {
  categories: CategorizedIngredients;
  selected: number[];
  onChange: (selected: number[]) => void;
}

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  protein: "Protein",
  vegetable: "Vegetables",
  carb: "Carbs",
  other: "Other",
};

function highlightMatch(name: string, query: string): React.ReactNode {
  if (!query.trim()) return name;
  const startIndex = name.toLowerCase().indexOf(query.toLowerCase());
  if (startIndex === -1) return name;
  const before = name.slice(0, startIndex);
  const match = name.slice(startIndex, startIndex + query.length);
  const after = name.slice(startIndex + query.length);
  return (
    <>
      {before}
      <span className="font-bold text-green-700">{match}</span>
      {after}
    </>
  );
}

export function IngredientSelector({
  categories,
  selected,
  onChange,
}: IngredientSelectorProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<IngredientCategory>>(
    new Set(INGREDIENT_CATEGORIES)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const allIngredients = useMemo(
    () =>
      INGREDIENT_CATEGORIES.flatMap((cat) =>
        categories[cat].map((ing) => ({ ...ing, category: cat }))
      ),
    [categories]
  );

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allIngredients.filter((ing) => ing.name.toLowerCase().includes(query));
  }, [searchQuery, allIngredients]);

  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.children[activeIndex] as HTMLElement;
      activeEl?.scrollIntoView?.({ block: "nearest" });
    }
  }, [activeIndex]);

  function toggleGroup(category: IngredientCategory) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function toggleIngredient(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function toggleAll(category: IngredientCategory) {
    const ids = categories[category].map((i) => i.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !ids.includes(id)));
    } else {
      const newSelected = new Set([...selected, ...ids]);
      onChange(Array.from(newSelected));
    }
  }

  function clearAll() {
    onChange([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isDropdownOpen) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setIsDropdownOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          toggleIngredient(suggestions[activeIndex].id);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        break;
      case "Tab":
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-end">
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear all ({selected.length})
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-controls="ingredient-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && suggestions[activeIndex]
              ? `suggestion-${suggestions[activeIndex].id}`
              : undefined
          }
          aria-label="Search ingredients"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActiveIndex(-1);
            setIsDropdownOpen(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsDropdownOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setIsDropdownOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-700 placeholder-gray-400"
        />

        {isDropdownOpen && suggestions.length > 0 && (
          <ul
            ref={listboxRef}
            id="ingredient-listbox"
            role="listbox"
            aria-label="Ingredient suggestions"
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => {
              const isSelected = selected.includes(suggestion.id);
              return (
                <li
                  key={suggestion.id}
                  id={`suggestion-${suggestion.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    toggleIngredient(suggestion.id);
                    inputRef.current?.focus();
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between ${
                    index === activeIndex
                      ? "bg-green-50 text-green-800"
                      : "text-gray-700"
                  }`}
                >
                  <span>{highlightMatch(suggestion.name, searchQuery)}</span>
                  {isSelected && (
                    <span className="text-green-600 text-xs" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        {INGREDIENT_CATEGORIES.map((category) => {
          const items = categories[category];
          if (items.length === 0) return null;

          const filteredItems = searchQuery.trim()
            ? items.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : items;
          if (filteredItems.length === 0) return null;

          const expanded = expandedGroups.has(category);
          const categoryIds = items.map((i) => i.id);
          const selectedCount = categoryIds.filter((id) =>
            selected.includes(id)
          ).length;
          const allSelected =
            categoryIds.length > 0 && selectedCount === categoryIds.length;

          return (
            <div
              key={category}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="flex items-center bg-gray-50 px-4 py-2">
                <button
                  onClick={() => toggleGroup(category)}
                  className="flex-1 flex items-center gap-2 text-left font-medium text-gray-700"
                  aria-expanded={expanded}
                  aria-controls={`group-${category}`}
                >
                  <span className="text-xs">{expanded ? "▼" : "▶"}</span>
                  {CATEGORY_LABELS[category]}
                  {selectedCount > 0 && (
                    <span className="text-xs text-green-600 font-normal">
                      ({selectedCount}/{items.length})
                    </span>
                  )}
                </button>
                <label className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => toggleAll(category)}
                    className="rounded"
                    aria-label={`Select all ${CATEGORY_LABELS[category]}`}
                  />
                  All
                </label>
              </div>

              {expanded && (
                <div
                  id={`group-${category}`}
                  role="group"
                  aria-label={CATEGORY_LABELS[category]}
                  className="flex flex-wrap gap-2 p-4"
                >
                  {filteredItems.map((ingredient) => {
                    const isSelected = selected.includes(ingredient.id);
                    return (
                      <button
                        key={ingredient.id}
                        onClick={() => toggleIngredient(ingredient.id)}
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isSelected
                            ? "bg-green-100 border-green-500 text-green-800"
                            : "bg-white border-gray-300 text-gray-700 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        {ingredient.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
