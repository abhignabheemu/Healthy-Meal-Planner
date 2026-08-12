# Healthy Meal Planner MVP - TODO.md

## Project Setup
- [x] Create Next.js 15 application
- [x] Configure TypeScript
- [x] Configure ESLint and Prettier
- [x] Install Tailwind CSS
- [x] Create project folder structure
- [x] Configure environment variables (.env)
- [x] Create README.md
- [x] Configure Git repository
- [x] Configure Vercel deployment settings

## Architecture & Design
- [x] Define application architecture
- [x] Define API route structure
- [x] Define shared TypeScript types
- [x] Define domain models
- [x] Create wireframes for Home, Results, and Weekly Planner pages
- [x] Create responsive layout design

## Database Setup
- [x] Install Prisma
- [x] Configure Prisma schema
- [x] Configure SQLite database
- [x] Create migrations
- [x] Seed database pipeline

## Data Models
### Recipe
- [x] Create Recipe model
- [x] Add name
- [x] Add description
- [x] Add prepTime
- [x] Add calories
- [x] Add difficulty
- [x] Add instructions

### Ingredient
- [x] Create Ingredient model
- [x] Add ingredient categories
- [x] Protein category
- [x] Vegetable category
- [x] Carb category
- [x] Other category

### RecipeIngredient
- [x] Create relationship table
- [x] Add required flag
- [x] Validate relationships

### Diet Tags
- [x] Create DietTag model
- [x] Vegetarian
- [x] Vegan
- [x] HighProtein
- [x] LowCarb
- [x] QuickMeal

## Seed Data
- [x] Create recipe JSON structure
- [x] Gather 50 curated recipes
- [x] Create 20 chicken recipes
- [x] Create 10 vegetarian recipes
- [x] Create 10 fish recipes
- [x] Create 10 egg/tofu recipes
- [x] Add calories
- [x] Add nutrition summaries
- [x] Add prep times
- [x] Add instructions
- [x] Import seed data into SQLite
- [x] Verify data quality

## Ingredient Catalog
### Proteins
- [x] Chicken
- [x] Fish
- [x] Tofu
- [x] Beans
- [x] Lentils
- [x] Eggs

### Vegetables
- [x] Broccoli
- [x] Spinach
- [x] Bell Pepper
- [x] Carrots
- [x] Tomatoes

### Carbs
- [x] Rice
- [x] Pasta
- [x] Potatoes
- [x] Quinoa
- [x] Bread

## Frontend - Home Page
- [x] Create homepage with title
- [x] Create hero section
- [x] Create ingredient selection section
- [x] Create dietary filter section
- [x] Build responsive layout

### Ingredient Selection
- [x] Protein selector
- [x] Vegetable selector
- [x] Carb selector
- [x] Multi-select support
- [x] Checkbox controls
- [x] Ingredient search
- [x] Autocomplete component
- [x] Clear selection functionality

### Dietary Preferences
- [x] Vegetarian filter
- [x] Vegan filter
- [x] High Protein filter
- [x] Low Carb filter
- [x] Quick Meals filter

### Actions
- [x] Generate Meals button
- [x] Generate Weekly Plan button
- [x] Loading state
- [x] Error state

## Frontend - Results Page
- [x] Create results page layout
- [x] Create recipe card component
- [x] Display recipe name
- [x] Display match percentage
- [x] Display missing ingredients
- [x] Display prep time
- [x] Display calories
- [x] Display difficulty
- [x] Display nutrition summary
- [x] Display instructions

### Sorting
- [x] Sort by match percentage
- [x] Sort by dietary preference match
- [x] Sort by healthy score
- [x] Sort by prep time

## Frontend - Weekly Planner
- [x] Create weekly planner page
- [x] Monday section
- [x] Tuesday section
- [x] Wednesday section
- [x] Thursday section
- [x] Friday section
- [x] Saturday section
- [x] Sunday section
- [x] Responsive design

## API Development
### Health Check API
- [x] GET /api/health endpoint
- [x] Database connectivity check

### Ingredients API
- [x] GET ingredients endpoint
- [x] Return ingredient catalog
- [x] Add validation

### Meal Recommendation API
- [x] POST /api/meals/recommend
- [x] Validate payload
- [x] Fetch recipes
- [x] Match ingredients
- [x] Apply dietary filters
- [x] Sort results
- [x] Return recommendations

### Weekly Plan API
- [x] POST /api/meals/weekly
- [x] Validate payload
- [x] Generate 7-day plan
- [x] Enforce no duplicate recipes
- [x] Limit consecutive protein repetition
- [x] Optimize ingredient reuse
- [x] Respect dietary preferences

## Recommendation Engine
### Matching Logic
- [x] Exact match calculation
- [x] One ingredient missing logic
- [x] Two ingredients missing logic
- [x] Hide recipes missing 3+ ingredients

### Match Scores
- [x] 100% match support
- [x] 90% match support
- [x] 80% match support

### Missing Ingredient Tracking
- [x] Identify missing ingredients
- [x] Return ingredient list to UI

## Validation & Error Handling
### Client Validation
- [x] Prevent empty submission
- [x] Display validation message

### API Validation
- [x] Validate request body
- [x] Validate ingredient values
- [x] Validate preference values

### Failure Handling
- [x] No results message
- [x] Generic API error message
- [x] Database error handling
- [x] Structured logging

## Performance
- [x] Page load under 2 seconds
- [x] Recommendation engine under 1 second
- [x] Weekly planner under 3 seconds
- [x] Optimize database queries
- [x] Add indexing where needed

## Security
- [x] Sanitize inputs
- [x] Protect API routes
- [x] Validate payloads
- [x] Secure environment variables
- [x] Ensure secrets are excluded from source control
- [ ] Evaluate rate limiting

## Logging & Monitoring
- [x] API request logging
- [x] Error logging
- [x] Development console logging
- [ ] Future Application Insights documentation

## Testing
### Test Infrastructure
- [x] Configure Vitest with jsdom environment
- [x] Configure React Testing Library
- [x] Configure coverage support (v8 provider)
- [x] Add `npm run test` script
- [x] Add `npm run test:coverage` script (text, HTML, lcov reporters)

### Smoke Tests
- [x] Homepage rendering test (Vitest + React Testing Library)

### Unit Tests
- [x] Exact match scenario
- [x] One missing ingredient scenario
- [x] Two missing ingredient scenario
- [x] More than two missing ingredients scenario
- [x] Case-insensitive matching test
- [x] Ranking by match percentage test
- [x] Ingredient category validation tests
- [x] Ingredient CRUD tests
- [x] Vegetarian filter tests
- [x] Low carb filter tests

### Integration Tests
- [x] Database connectivity test
- [x] Recipe creation and querying test
- [x] Recipe-ingredient relationship test
- [x] Diet tag creation and querying test
- [x] Unique constraint enforcement tests
- [x] Generate meals flow
- [x] Weekly plan flow
- [x] No results flow

### UI Tests
- [x] Ingredient search
- [x] Multi-select functionality
- [x] Recommendation workflow loading state
- [x] Recommendation workflow error state
- [x] Mobile responsiveness
- [x] Desktop responsiveness

### Playwright
- [ ] Configure Playwright
- [ ] Create core user journey tests

## Deployment
- [x] Deploy to Vercel
- [x] Verify environment configuration
- [x] Verify production database
- [x] Smoke testing
- [x] Production validation

## Definition of Done Verification
- [x] Ingredient selection works
- [x] Meal recommendations work
- [x] Missing ingredient display works
- [x] Weekly planner works
- [x] Dietary filters work
- [x] Mobile responsive
- [x] Desktop responsive
- [x] Application deployed successfully
- [x] Critical tests pass
- [x] Zero infrastructure cost maintained

## Future Backlog
### Phase 2
- [ ] AI recipe customization
- [ ] Ingredient substitutions
- [ ] Nutrition explanations
- [ ] Shopping list generation

### Phase 3
- [ ] User accounts
- [ ] Pantry management
- [ ] Saved meal plans
- [ ] Family preferences

### Phase 4
- [ ] Fridge image upload
- [ ] Ingredient recognition
- [ ] Voice assistant integration
- [ ] Personalized meal coach
