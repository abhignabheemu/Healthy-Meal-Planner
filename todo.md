# Healthy Meal Planner MVP - TODO.md

## Project Setup
- [x] Create Next.js 15 application
- [x] Configure TypeScript
- [x] Configure ESLint and Prettier
- [x] Install Tailwind CSS
- [x] Create project folder structure
- [ ] Configure environment variables (.env)
- [ ] Create README.md
- [x] Configure Git repository
- [ ] Configure Vercel deployment settings

## Architecture & Design
- [x] Define application architecture
- [x] Define API route structure
- [x] Define shared TypeScript types
- [x] Define domain models
- [ ] Create wireframes for Home, Results, and Weekly Planner pages
- [ ] Create responsive layout design

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
- [ ] Create hero section
- [ ] Create ingredient selection section
- [ ] Create dietary filter section
- [ ] Build responsive layout

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
- [ ] Vegetarian filter
- [ ] Vegan filter
- [ ] High Protein filter
- [ ] Low Carb filter
- [ ] Quick Meals filter

### Actions
- [ ] Generate Meals button
- [ ] Generate Weekly Plan button
- [ ] Loading state
- [ ] Error state

## Frontend - Results Page
- [ ] Create results page layout
- [ ] Create recipe card component
- [ ] Display recipe name
- [ ] Display match percentage
- [ ] Display missing ingredients
- [ ] Display prep time
- [ ] Display calories
- [ ] Display difficulty
- [ ] Display nutrition summary
- [ ] Display instructions

### Sorting
- [x] Sort by match percentage
- [ ] Sort by dietary preference match
- [x] Sort by healthy score
- [x] Sort by prep time

## Frontend - Weekly Planner
- [ ] Create weekly planner page
- [ ] Monday section
- [ ] Tuesday section
- [ ] Wednesday section
- [ ] Thursday section
- [ ] Friday section
- [ ] Saturday section
- [ ] Sunday section
- [ ] Responsive design

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
- [ ] POST /api/meals/weekly
- [ ] Validate payload
- [ ] Generate 7-day plan
- [ ] Enforce no duplicate recipes
- [ ] Limit consecutive protein repetition
- [ ] Optimize ingredient reuse
- [ ] Respect dietary preferences

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
- [ ] Prevent empty submission
- [ ] Display validation message

### API Validation
- [ ] Validate request body
- [ ] Validate ingredient values
- [ ] Validate preference values

### Failure Handling
- [ ] No results message
- [ ] Generic API error message
- [ ] Database error handling
- [ ] Structured logging

## Performance
- [ ] Page load under 2 seconds
- [ ] Recommendation engine under 1 second
- [ ] Weekly planner under 3 seconds
- [ ] Optimize database queries
- [ ] Add indexing where needed

## Security
- [ ] Sanitize inputs
- [ ] Protect API routes
- [ ] Validate payloads
- [ ] Secure environment variables
- [ ] Ensure secrets are excluded from source control
- [ ] Evaluate rate limiting

## Logging & Monitoring
- [ ] API request logging
- [ ] Error logging
- [ ] Development console logging
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
- [ ] Vegetarian filter tests
- [ ] Low carb filter tests

### Integration Tests
- [x] Database connectivity test
- [x] Recipe creation and querying test
- [x] Recipe-ingredient relationship test
- [x] Diet tag creation and querying test
- [x] Unique constraint enforcement tests
- [ ] Generate meals flow
- [ ] Weekly plan flow
- [ ] No results flow

### UI Tests
- [x] Ingredient search
- [x] Multi-select functionality
- [ ] Mobile responsiveness
- [ ] Desktop responsiveness

### Playwright
- [ ] Configure Playwright
- [ ] Create core user journey tests

## Deployment
- [ ] Deploy to Vercel
- [ ] Verify environment configuration
- [ ] Verify production database
- [ ] Smoke testing
- [ ] Production validation

## Definition of Done Verification
- [ ] Ingredient selection works
- [ ] Meal recommendations work
- [ ] Missing ingredient display works
- [ ] Weekly planner works
- [ ] Dietary filters work
- [ ] Mobile responsive
- [ ] Desktop responsive
- [ ] Application deployed successfully
- [ ] Critical tests pass
- [ ] Zero infrastructure cost maintained

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
