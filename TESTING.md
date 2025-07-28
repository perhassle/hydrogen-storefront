# Playwright E2E Testing Infrastructure

This project includes a comprehensive end-to-end testing infrastructure built with Playwright, featuring AI-powered auto-discovery capabilities and cross-browser testing.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- All npm dependencies installed (`npm install`)
- Playwright browsers installed (`npm run test:install`)

### Running Tests

```bash
# Install Playwright browsers (first time only)
npm run test:install

# Run all tests
npm run test

# Run specific test suites
npm run test:e2e           # Core E2E tests
npm run test:auto-discovery # AI-powered discovery tests
npm run test:visual        # Visual regression tests

# Run tests in specific browsers
npm run test:chrome        # Chrome only
npm run test:firefox       # Firefox only
npm run test:safari        # Safari only
npm run test:mobile        # Mobile browsers

# Interactive test modes
npm run test:headed        # Run with browser UI visible
npm run test:ui            # Open Playwright UI
npm run test:debug         # Debug mode with step-through
```

## 🧪 Test Suites

### Core E2E Tests (`tests/e2e/`)
- **Product Browsing** (`product-browsing.spec.ts`) - Product discovery, viewing, variants
- **Cart Functionality** (`cart.spec.ts`) - Add to cart, quantity management, checkout
- **Search & Filters** (`search.spec.ts`) - Search functionality, filtering, pagination
- **Navigation** (`navigation.spec.ts`) - Menu interactions, mobile navigation, breadcrumbs

### AI-Powered Auto-Discovery (`tests/auto-discovery/`)
- **Site Exploration** (`site-exploration.spec.ts`) - Autonomous site mapping and element discovery
- **AI-Generated Tests** (`ai-generated-tests.spec.ts`) - Dynamic test generation based on discovered functionality

### Visual Regression (`tests/visual/`)
- **Visual Regression** (`visual-regression.spec.ts`) - Screenshot comparisons across browsers and viewports

## 🏗️ Architecture

### Page Object Models (`tests/pages/`)
- **BasePage** - Common functionality across all pages
- **HomePage** - Homepage-specific interactions
- **ProductPage** - Product page functionality
- **CartPage** - Shopping cart management
- **SearchPage** - Search and filtering capabilities

### Utilities (`tests/utils/`)
- **AuthHelpers** - User authentication and account management
- **ApiHelpers** - API mocking and monitoring
- **VisualHelpers** - Visual testing and screenshot utilities

### Test Data (`tests/fixtures/`)
- **test-data.ts** - Sample products, customers, search queries
- **page-fixtures.ts** - Playwright fixtures for page objects

## 🤖 AI-Powered Features

### Autonomous Site Exploration
The auto-discovery tests can:
- Map the entire site structure automatically
- Identify interactive elements (buttons, forms, links)
- Generate tests for discovered functionality
- Detect accessibility issues
- Test edge cases automatically

### Natural Language Test Instructions
```typescript
// Example: AI interprets and executes natural language instructions
await executeNaturalLanguageTest(page, "Explore the homepage and test all product links");
await executeNaturalLanguageTest(page, "Find and test the cart functionality");
```

### Dynamic Test Coverage
Tests adapt based on discovered site features:
- E-commerce functionality (products, cart, checkout)
- Search capabilities
- Forms and validation
- Navigation patterns

## 📱 Cross-Browser & Responsive Testing

Tests run across multiple browsers and viewports:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome Mobile, Safari Mobile
- **Viewports**: Mobile (375px), Tablet (768px), Desktop (1280px+)

## 🎨 Visual Regression Testing

Automated screenshot testing for:
- Full page layouts
- Component states (hover, focus, error)
- Responsive design across breakpoints
- Loading states and animations
- Modal and overlay interactions

## ⚙️ Configuration

### Main Configuration (`playwright.config.ts`)
- Cross-browser projects
- Test timeouts and retries
- Screenshot and video capture
- Global setup and teardown

### Environment Variables
```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000  # Override base URL
CI=true                                    # Enable CI-specific settings
```

## 🔧 Development Workflow

### Writing New Tests
1. Use page object models for maintainable tests:
```typescript
import { test, expect } from '../fixtures/page-fixtures';

test('should test product functionality', async ({ productPage }) => {
  await productPage.goto('sample-product');
  await productPage.addToCart();
  expect(await productPage.getCartCount()).toBeGreaterThan(0);
});
```

2. Leverage test utilities:
```typescript
import { AuthHelpers, VisualHelpers } from '../utils';

test('authenticated user test', async ({ page }) => {
  const auth = new AuthHelpers(page);
  await auth.login(testCustomer);
  
  const visual = new VisualHelpers(page);
  await visual.takeFullPageScreenshot('authenticated-homepage');
});
```

### Test Data Management
Use the test data fixtures for consistent testing:
```typescript
import { sampleProducts, searchQueries } from '../fixtures/test-data';

// Use predefined test data
await searchPage.search(searchQueries.popular[0]);
```

## 📊 Test Reports

Test results are available in multiple formats:
- **HTML Report**: `test-results/html/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`

View reports:
```bash
npm run test:report  # Opens HTML report in browser
```

## 🚨 Troubleshooting

### Common Issues

**Tests timeout on startup**
- Ensure the development server is running (`npm run dev`)
- Check if the correct port is configured in `playwright.config.ts`

**Browser installation issues**
```bash
# Reinstall browsers
npm run test:install

# Check system dependencies (Linux)
npx playwright install-deps
```

**Visual tests failing**
- Update baseline screenshots if changes are intentional
- Check for animation timing issues
- Verify consistent test environment

### Debug Mode
```bash
# Run tests with step-through debugging
npm run test:debug

# Generate new test code interactively
npm run test:codegen
```

## 🎯 Best Practices

### Test Structure
- Use descriptive test names
- Group related tests in describe blocks
- Keep tests independent and isolated
- Use page object models for reusability

### Performance
- Limit parallel test execution on CI
- Use test fixtures to share setup between tests
- Mock external API calls where appropriate

### Maintenance
- Update selectors as UI changes
- Keep test data relevant and up-to-date
- Review and update visual baselines regularly

## 🔮 Future Enhancements

The testing infrastructure is designed to be extensible:
- Integration with CI/CD pipelines
- Performance testing capabilities
- Accessibility automation
- API testing integration
- Cross-device testing expansion

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs)
- [Shopify Hydrogen Testing Guide](https://shopify.dev/docs/custom-storefronts/hydrogen/testing)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Visual Testing Best Practices](https://playwright.dev/docs/test-snapshots)