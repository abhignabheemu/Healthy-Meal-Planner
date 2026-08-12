# Healthy Meal Planner

A Next.js 15 meal-planning app that recommends recipes based on ingredients already available at home and generates a 7-day weekly plan with dietary and variety constraints.

## Features

- Ingredient selection with category grouping and search
- Dietary filters: Vegetarian, Vegan, HighProtein, LowCarb, QuickMeal
- Recipe recommendations ranked by ingredient match
- Weekly planner that creates a Monday–Sunday schedule
- SQLite-powered data layer via Prisma
- Responsive UI built with Tailwind CSS

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma + SQLite
- Tailwind CSS
- Vitest + React Testing Library

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

   If there is no .env.example file in the repo, add a file with:

   ```bash
   DATABASE_URL="file:./dev.db"
   ```

3. Run Prisma migrations and seed data:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in the browser at:

   ```text
   http://localhost:3000
   ```

## Project Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:coverage
npx prisma migrate dev
npx prisma db seed
```

## App Structure

- `app/` — route pages and UI
- `app/api/` — API routes for ingredients, recommendations, and weekly planning
- `lib/` — shared logic and DB access
- `prisma/` — schema and seed data
- `__tests__/` — unit, integration, and UI tests

## Deployment

This project is prepared for Vercel deployment with a SQLite-backed local development setup. For production, use a persistent database provider compatible with Prisma and set `DATABASE_URL` in Vercel environment variables.

## Notes

- The recommendation engine hides recipes that are missing 3 or more required ingredients.
- The weekly planner avoids duplicate recipes and reduces repeated protein patterns across the week.
