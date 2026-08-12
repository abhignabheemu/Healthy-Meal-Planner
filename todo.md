# Healthy Meal Planner MVP - TODO.md

## Project Setup
- [ ] Create Next.js 15 application
- [ ] Configure TypeScript
- [ ] Configure ESLint and Prettier
- [ ] Install Tailwind CSS
- [ ] Create project folder structure
- [ ] Configure environment variables (.env)
- [ ] Create README.md
- [ ] Configure Git repository
- [ ] Configure Vercel deployment settings

## Architecture & Design
- [ ] Define application architecture
- [ ] Define API route structure
- [ ] Define shared TypeScript types
- [ ] Define domain models
- [ ] Create wireframes for Home, Results, and Weekly Planner pages
- [ ] Create responsive layout design

## Database Setup
- [ ] Install Prisma
- [ ] Configure Prisma schema
- [ ] Configure SQLite database
- [ ] Create migrations
- [ ] Seed database pipeline

## Data Models
### Recipe
- [ ] Create Recipe model
- [ ] Add name
- [ ] Add description
- [ ] Add prepTime
- [ ] Add calories
- [ ] Add difficulty
- [ ] Add instructions

### Ingredient
- [ ] Create Ingredient model
- [ ] Add ingredient categories
- [ ] Protein category
- [ ] Vegetable category
- [ ] Carb category
- [ ] Other category

### RecipeIngredient
- [ ] Create relationship table
- [ ] Add required flag
- [ ] Validate relationships

### Diet Tags
- [ ] Create DietTag model
- [ ] Vegetarian
- [ ] Vegan
- [ ] HighProtein
- [ ] LowCarb
- [ ] QuickMeal

## Seed Data
- [ ] Create recipe JSON structure
- [ ] Gather 50 curated recipes
- [ ] Create 20 chicken recipes
- [ ] Create 10 vegetarian recipes
- [ ] Create 10 fish recipes
- [ ] Create 10 egg/tofu recipes
- [ ] Add calories
- [ ] Add nutrition summaries
- [ ] Add prep times
- [ ] Add instructions
- [ ] Import seed data into SQLite
- [ ] Verify data quality

## Ingredient Catalog
### Proteins
- [ ] Chicken
- [ ] Fish
- [ ] Tofu
- [ ] Beans
- [ ] Lentils
- [ ] Eggs

### Vegetables
- [ ] Broccoli
- [ ] Spinach
- [ ] Bell Pepper
- [ ] Carrots
- [ ] Tomatoes

### Carbs
- [ ] Rice
- [ ] Pasta
- [ ] Potatoes
- [ ] Quinoa
- [ ] Bread

## Frontend - Home Page
- [ ] Create hero section
- [ ] Create ingredient selection section
- [ ] Create dietary filter section
- [ ] Build responsive layout

### Ingredient Selection
- [ ] Protein selector
- [ ] Vegetable selector
- [ ] Carb selector
- [ ] Multi-select support
- [ ] Checkbox controls
- [ ] Ingredient search
- [ ] Autocomplete component
- [ ] Clear selection functionality

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
- [ ] Sort by match percentage
- [ ] Sort by dietary preference match
- [ ] Sort by healthy score
- [ ] Sort by prep time

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
### Ingredients API
- [ ] GET ingredients endpoint
- [ ] Return ingredient catalog
- [ ] Add validation

### Meal Recommendation API
- [ ] POST /api/meals/recommend
- [ ] Validate payload
- [ ] Fetch recipes
- [ ] Match ingredients
- [ ] Apply dietary filters
- [ ] Sort results
- [ ] Return recommendations

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
- [ ] Exact match calculation
- [ ] One ingredient missing logic
- [ ] Two ingredients missing logic
- [ ] Hide recipes missing 3+ ingredients

### Match Scores
- [ ] 100% match support
- [ ] 90% match support
- [ ] 80% match support

### Missing Ingredient Tracking
- [ ] Identify missing ingredients
- [ ] Return ingredient list to UI

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
### Unit Tests
- [ ] Exact match scenario
- [ ] One missing ingredient scenario
- [ ] Two missing ingredient scenario
- [ ] More than two missing ingredients scenario
- [ ] Vegetarian filter tests
- [ ] Low carb filter tests

### Integration Tests
- [ ] Generate meals flow
- [ ] Weekly plan flow
- [ ] No results flow

### UI Tests
- [ ] Ingredient search
- [ ] Multi-select functionality
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
