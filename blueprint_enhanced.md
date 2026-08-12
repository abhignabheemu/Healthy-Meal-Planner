## Healthy Meal Planner - Solution Blueprint

### Vision
Enable users to discover healthy meals using ingredients already available at home while minimizing food waste and simplifying weekly meal planning.

# Existing Blueprint

(Original blueprint retained.)

---

# Implementation Prompt Roadmap

## Prompt 1 – Project Initialization
```text
You are a senior Next.js engineer.
Create a Next.js 15 application using App Router, TypeScript, TailwindCSS and ESLint.
Add a homepage titled Healthy Meal Planner.
Add a smoke test verifying homepage rendering.
Acceptance Criteria:
- npm run dev works
- npm run lint passes
- tests pass
```

## Prompt 2 – Testing Infrastructure
```text
Configure Vitest, React Testing Library and jsdom.
Add sample tests and coverage support.
Acceptance Criteria:
- npm run test passes
- coverage report generates
```

## Prompt 3 – Prisma + SQLite
```text
Install and configure Prisma with SQLite.
Create database configuration and connectivity health check.
Write tests verifying database access.
```

## Prompt 4 – Ingredient Domain Model
```text
Create Ingredient model.
Fields:
- id
- name
- category
Categories:
- protein
- vegetable
- carb
- other
Create migrations and tests.
```

## Prompt 5 – Recipe Domain Model
```text
Create Recipe and RecipeIngredient models.
Implement relationships.
Add tests for creation and retrieval.
```

## Prompt 6 – Dietary Tags
```text
Create DietTag model.
Support Vegetarian, Vegan, HighProtein, LowCarb and QuickMeal.
Add tests.
```

## Prompt 7 – Seed Data
```text
Create seed infrastructure.
Seed ingredients, diet tags and starter recipes.
Ensure idempotent execution.
```

## Prompt 8 – Matching Engine
```text
Implement recipe matching engine using TDD.
Rules:
- 100% exact match
- 90% one missing ingredient
- 80% two missing ingredients
- hide recipes with three or more missing ingredients
Return missing ingredient list.
```

## Prompt 9 – Ranking Service
```text
Rank recipes by:
1. Match percentage
2. Healthy score
3. Prep time
Write tests first.
```

## Prompt 10 – Recommendation API
```text
Create POST /api/meals/recommend.
Validate requests.
Integrate matching engine.
Add integration tests.
```

## Prompt 11 – Ingredient API
```text
Create GET /api/ingredients.
Return categorized ingredients.
Add integration tests.
```

## Prompt 12 – Ingredient Selection UI
```text
Build ingredient selector.
Support grouping and multiselect.
Create component tests.
```

## Prompt 13 – Ingredient Search
```text
Add autocomplete search with keyboard accessibility.
Add tests.
```

## Prompt 14 – Recommendation Workflow
```text
Connect UI to recommendation API.
Handle loading, success and error states.
Add tests.
```

## Prompt 15 – Recipe Cards
```text
Create reusable recipe card component.
Display match score, missing ingredients, calories, prep time and difficulty.
```

## Prompt 16 – Recipe Instructions
```text
Display recipe instructions using accessible numbered steps.
Add tests.
```

## Prompt 17 – Weekly Planner Engine
```text
Build weekly planner using TDD.
Rules:
- seven meals
- no duplicates
- avoid excessive protein repetition
- maximize ingredient reuse
```

## Prompt 18 – Weekly Planner API
```text
Create POST /api/meals/weekly.
Connect planning service.
Add integration tests.
```

## Prompt 19 – Weekly Planner UI
```text
Create weekly meal planner screen.
Display Monday through Sunday meal assignments.
Handle loading and errors.
```

## Prompt 20 – Production Hardening
```text
Improve logging, error handling, responsiveness and performance.
Prepare application for Vercel deployment.
Add final test coverage improvements.
```
