# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthy Meal Planner — a web app that recommends meals based on ingredients users have at home, with dietary filtering and weekly meal planning. Zero infrastructure cost target (SQLite + Vercel).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **ORM:** Prisma with SQLite
- **Testing:** Vitest + React Testing Library (unit/integration), Playwright (E2E)
- **Deployment:** Vercel

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit/integration tests
npm run test -- --run src/path/to/file.test.ts  # Single test file
npx prisma migrate dev   # Run database migrations
npx prisma db seed       # Seed database (idempotent)
npx playwright test      # E2E tests
```

## Architecture

### Pages (App Router)
- `/` — Home: ingredient selection + dietary filters + generate actions
- `/results` — Recipe cards ranked by match score
- `/weekly` — 7-day meal planner grid

### API Routes
- `GET /api/ingredients` — categorized ingredient catalog
- `POST /api/meals/recommend` — returns ranked recipes given selected ingredients + preferences
- `POST /api/meals/weekly` — generates 7-day plan with variety constraints

### Core Engine: Recommendation Matching
Recipes are scored by how many required ingredients the user has:
- 100% = exact match (all ingredients available)
- 90% = one ingredient missing
- 80% = two ingredients missing
- Hidden = three or more missing

Results are ranked by: match percentage > healthy score > prep time.

### Weekly Planner Constraints
- Exactly 7 meals, no duplicate recipes
- Avoid consecutive same-protein days
- Maximize ingredient reuse across the week
- Respect dietary filters

### Data Models (Prisma)
- **Recipe** — name, description, prepTime, calories, difficulty, instructions
- **Ingredient** — name, category (protein | vegetable | carb | other)
- **RecipeIngredient** — many-to-many join with `required` flag
- **DietTag** — enum: Vegetarian, Vegan, HighProtein, LowCarb, QuickMeal

### Seed Data
~50 curated recipes (20 chicken, 10 vegetarian, 10 fish, 10 egg/tofu) with full nutrition info and instructions. Seed script must be idempotent.
