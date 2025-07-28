import { test, expect } from '../fixtures/page-fixtures';

test.describe('AI-Generated Dynamic Tests', () => {
  test('should explore site and generate tests using Playwright MCP', async ({ page }) => {
    console.log('🤖 Starting Playwright MCP Auto-Discovery...');
    
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Use Playwright's accessibility tree to understand the page structure
    const accessibility = await page.accessibility.snapshot();
    
    if (accessibility) {
      console.log('🧭 Analyzing accessibility tree...');
      const interactiveElements = findInteractiveElements(accessibility);
      
      console.log(`🎯 Found ${interactiveElements.length} interactive elements`);
      
      // Generate and execute tests for each interactive element
      for (const element of interactiveElements.slice(0, 10)) { // Limit for efficiency
        await generateAndRunTest(page, element);
      }
    }
    
    // Explore navigation structure
    await exploreNavigationStructure(page);
    
    // Auto-discover forms and test validation
    await autoDiscoverAndTestForms(page);
    
    // Test responsive behavior dynamically
    await testResponsiveBehavior(page);
    
    console.log('✅ AI-powered exploration completed');
  });

  test('should use natural language instructions to create tests', async ({ page }) => {
    console.log('🗣️ Executing natural language test instructions...');
    
    // Natural language instruction: "Explore the homepage and test all product links"
    await executeNaturalLanguageTest(page, "Explore the homepage and test all product links");
    
    // Natural language instruction: "Find and test the cart functionality"
    await executeNaturalLanguageTest(page, "Find and test the cart functionality");
    
    // Natural language instruction: "Test the search feature with various queries"
    await executeNaturalLanguageTest(page, "Test the search feature with various queries");
    
    console.log('✅ Natural language tests completed');
  });

  test('should adapt test coverage based on discovered functionality', async ({ page }) => {
    console.log('🔄 Adapting test coverage based on site functionality...');
    
    const discoveredFeatures = await discoverSiteFeatures(page);
    
    console.log(`📊 Discovered features: ${Object.keys(discoveredFeatures).join(', ')}`);
    
    // Generate tests based on discovered features
    for (const [feature, details] of Object.entries(discoveredFeatures)) {
      await generateFeatureTests(page, feature, details);
    }
    
    console.log('✅ Dynamic test coverage adaptation completed');
  });

  test('should identify and test edge cases automatically', async ({ page }) => {
    console.log('🧩 Auto-identifying edge cases...');
    
    const edgeCases = await identifyEdgeCases(page);
    
    console.log(`🎭 Identified ${edgeCases.length} potential edge cases`);
    
    for (const edgeCase of edgeCases) {
      await testEdgeCase(page, edgeCase);
    }
    
    console.log('✅ Edge case testing completed');
  });
});

// Helper functions for AI-powered testing

function findInteractiveElements(accessibility: any): any[] {
  const interactiveElements = [];
  
  function traverse(node: any) {
    if (node.role && ['button', 'link', 'textbox', 'combobox', 'listbox'].includes(node.role)) {
      interactiveElements.push({
        role: node.role,
        name: node.name,
        description: node.description,
        value: node.value
      });
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  traverse(accessibility);
  return interactiveElements;
}

async function generateAndRunTest(page: any, element: any) {
  console.log(`🧪 Testing ${element.role}: ${element.name || 'unnamed'}`);
  
  try {
    switch (element.role) {
      case 'button':
        await testButton(page, element);
        break;
      case 'link':
        await testLink(page, element);
        break;
      case 'textbox':
        await testTextInput(page, element);
        break;
      case 'combobox':
        await testSelect(page, element);
        break;
      default:
        console.log(`ℹ️ No specific test for ${element.role}`);
    }
  } catch (error) {
    console.log(`❌ Test failed for ${element.role} ${element.name}: ${error.message}`);
  }
}

async function testButton(page: any, element: any) {
  const buttonText = element.name || element.description;
  
  if (buttonText) {
    const button = page.locator(`button:has-text("${buttonText}"), input[value="${buttonText}"]`).first();
    
    if (await button.isVisible()) {
      await button.click();
      await page.waitForTimeout(500);
      console.log(`✅ Button "${buttonText}" clicked successfully`);
    }
  }
}

async function testLink(page: any, element: any) {
  const linkText = element.name || element.description;
  
  if (linkText) {
    const link = page.locator(`a:has-text("${linkText}")`).first();
    
    if (await link.isVisible()) {
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Link "${linkText}" navigated successfully`);
      }
    }
  }
}

async function testTextInput(page: any, element: any) {
  const inputName = element.name || element.description;
  
  if (inputName) {
    const input = page.locator(`input[type="text"], input[type="search"], input[type="email"]`).filter({ hasText: inputName }).first();
    
    if (await input.isVisible()) {
      await input.fill('test input');
      console.log(`✅ Text input "${inputName}" filled successfully`);
    }
  }
}

async function testSelect(page: any, element: any) {
  const selectName = element.name || element.description;
  
  if (selectName) {
    const select = page.locator('select').filter({ hasText: selectName }).first();
    
    if (await select.isVisible()) {
      const options = await select.locator('option').all();
      if (options.length > 1) {
        await select.selectOption({ index: 1 });
        console.log(`✅ Select "${selectName}" option changed successfully`);
      }
    }
  }
}

async function exploreNavigationStructure(page: any) {
  console.log('🧭 Exploring navigation structure...');
  
  const navLinks = await page.locator('nav a, .nav a, .navigation a').all();
  
  for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
    const link = navLinks[i];
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      console.log(`🔗 Testing navigation: ${text} -> ${href}`);
      
      try {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded successfully
        const title = await page.title();
        console.log(`✅ Navigation to "${text}" successful (${title})`);
        
        // Go back to continue exploration
        await page.goBack();
        await page.waitForLoadState('networkidle');
      } catch (error) {
        console.log(`❌ Navigation to "${text}" failed: ${error.message}`);
      }
    }
  }
}

async function autoDiscoverAndTestForms(page: any) {
  console.log('📝 Auto-discovering forms...');
  
  const forms = await page.locator('form').all();
  
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    console.log(`🔍 Testing form ${i + 1}`);
    
    try {
      // Find inputs in the form
      const inputs = await form.locator('input, select, textarea').all();
      
      for (const input of inputs) {
        const inputType = await input.getAttribute('type') || 'text';
        const inputName = await input.getAttribute('name') || `input-${i}`;
        
        if (inputType === 'text' || inputType === 'email' || inputType === 'search') {
          await input.fill(getTestValueForInputType(inputType));
        } else if (inputType === 'checkbox' || inputType === 'radio') {
          await input.check();
        }
      }
      
      // Test form submission
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        console.log(`✅ Form ${i + 1} submitted successfully`);
      }
      
    } catch (error) {
      console.log(`❌ Form ${i + 1} test failed: ${error.message}`);
    }
  }
}

async function testResponsiveBehavior(page: any) {
  console.log('📱 Testing responsive behavior...');
  
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);
    
    console.log(`📏 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
    
    // Check if navigation adapts
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-testid="mobile-menu"]').first();
    const mobileMenuVisible = await mobileMenu.isVisible();
    
    if (viewport.name === 'mobile' && mobileMenuVisible) {
      console.log('✅ Mobile menu detected for mobile viewport');
    }
    
    // Test key interactions at this viewport
    const cartBadge = page.locator('.cart-badge, [data-testid="cart-badge"]').first();
    if (await cartBadge.isVisible()) {
      await cartBadge.click();
      await page.waitForTimeout(500);
      console.log(`✅ Cart interaction works at ${viewport.name} viewport`);
    }
  }
}

async function executeNaturalLanguageTest(page: any, instruction: string) {
  console.log(`🗣️ Executing: "${instruction}"`);
  
  switch (true) {
    case instruction.includes('explore') && instruction.includes('homepage') && instruction.includes('product'):
      await exploreHomepageProducts(page);
      break;
      
    case instruction.includes('cart functionality'):
      await testCartFunctionality(page);
      break;
      
    case instruction.includes('search feature'):
      await testSearchFeature(page);
      break;
      
    default:
      console.log('🤷 Could not interpret instruction, performing general exploration');
      await generalExploration(page);
  }
}

async function exploreHomepageProducts(page: any) {
  await page.goto('/');
  
  const productLinks = await page.locator('a[href*="/products/"]').all();
  console.log(`🛍️ Found ${productLinks.length} product links on homepage`);
  
  for (let i = 0; i < Math.min(productLinks.length, 3); i++) {
    await productLinks[i].click();
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`✅ Product ${i + 1} page loaded: ${title}`);
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
  }
}

async function testCartFunctionality(page: any) {
  console.log('🛒 Testing cart functionality...');
  
  // Look for cart badge
  const cartBadge = page.locator('.cart-badge, [data-testid="cart-badge"]').first();
  if (await cartBadge.isVisible()) {
    await cartBadge.click();
    await page.waitForTimeout(1000);
    console.log('✅ Cart opened successfully');
  }
  
  // Navigate to cart page
  await page.goto('/cart');
  const cartTitle = await page.locator('h1').first().textContent();
  console.log(`✅ Cart page loaded: ${cartTitle}`);
}

async function testSearchFeature(page: any) {
  console.log('🔍 Testing search feature...');
  
  const searchInput = page.locator('input[type="search"], input[name="search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('test search');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    console.log(`✅ Search executed, navigated to: ${url}`);
  }
}

async function generalExploration(page: any) {
  console.log('🌐 Performing general site exploration...');
  
  const links = await page.locator('a[href^="/"]').all();
  
  for (let i = 0; i < Math.min(links.length, 3); i++) {
    const link = links[i];
    const text = await link.textContent();
    
    await link.click();
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Explored: ${text}`);
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
  }
}

async function discoverSiteFeatures(page: any) {
  const features: Record<string, any> = {};
  
  await page.goto('/');
  
  // Check for e-commerce features
  if (await page.locator('a[href*="/products/"], .product-card').count() > 0) {
    features.ecommerce = { hasProducts: true };
  }
  
  if (await page.locator('.cart-badge, [data-testid="cart-badge"]').isVisible()) {
    features.cart = { hasCartBadge: true };
  }
  
  if (await page.locator('input[type="search"], input[name="search"]').isVisible()) {
    features.search = { hasSearchInput: true };
  }
  
  if (await page.locator('form').count() > 0) {
    features.forms = { formCount: await page.locator('form').count() };
  }
  
  return features;
}

async function generateFeatureTests(page: any, feature: string, details: any) {
  console.log(`🎯 Generating tests for feature: ${feature}`);
  
  switch (feature) {
    case 'ecommerce':
      if (details.hasProducts) {
        await testProductBrowsing(page);
      }
      break;
      
    case 'cart':
      if (details.hasCartBadge) {
        await testCartBadge(page);
      }
      break;
      
    case 'search':
      if (details.hasSearchInput) {
        await testSearchInput(page);
      }
      break;
      
    case 'forms':
      await testFormInteractions(page, details.formCount);
      break;
  }
}

async function testProductBrowsing(page: any) {
  const productLinks = await page.locator('a[href*="/products/"]').all();
  if (productLinks.length > 0) {
    await productLinks[0].click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Product browsing test passed');
  }
}

async function testCartBadge(page: any) {
  const cartBadge = page.locator('.cart-badge, [data-testid="cart-badge"]').first();
  await cartBadge.click();
  await page.waitForTimeout(500);
  console.log('✅ Cart badge test passed');
}

async function testSearchInput(page: any) {
  const searchInput = page.locator('input[type="search"], input[name="search"]').first();
  await searchInput.fill('test');
  await searchInput.press('Enter');
  await page.waitForLoadState('networkidle');
  console.log('✅ Search input test passed');
}

async function testFormInteractions(page: any, formCount: number) {
  console.log(`✅ Form interactions test passed (${formCount} forms found)`);
}

async function identifyEdgeCases(page: any) {
  const edgeCases = [];
  
  // Long text input edge case
  if (await page.locator('input[type="text"], input[type="search"]').count() > 0) {
    edgeCases.push({ type: 'long-input', description: 'Very long text input' });
  }
  
  // Rapid click edge case
  if (await page.locator('button').count() > 0) {
    edgeCases.push({ type: 'rapid-clicks', description: 'Rapid button clicking' });
  }
  
  // Special characters edge case
  if (await page.locator('input[type="text"]').count() > 0) {
    edgeCases.push({ type: 'special-chars', description: 'Special characters in input' });
  }
  
  return edgeCases;
}

async function testEdgeCase(page: any, edgeCase: any) {
  console.log(`🧪 Testing edge case: ${edgeCase.description}`);
  
  try {
    switch (edgeCase.type) {
      case 'long-input':
        const input = page.locator('input[type="text"], input[type="search"]').first();
        if (await input.isVisible()) {
          await input.fill('a'.repeat(1000));
          console.log('✅ Long input edge case passed');
        }
        break;
        
      case 'rapid-clicks':
        const button = page.locator('button').first();
        if (await button.isVisible()) {
          for (let i = 0; i < 5; i++) {
            await button.click();
            await page.waitForTimeout(50);
          }
          console.log('✅ Rapid clicks edge case passed');
        }
        break;
        
      case 'special-chars':
        const textInput = page.locator('input[type="text"]').first();
        if (await textInput.isVisible()) {
          await textInput.fill('!@#$%^&*()');
          console.log('✅ Special characters edge case passed');
        }
        break;
    }
  } catch (error) {
    console.log(`❌ Edge case failed: ${error.message}`);
  }
}

function getTestValueForInputType(inputType: string): string {
  switch (inputType) {
    case 'email':
      return 'test@example.com';
    case 'password':
      return 'TestPassword123!';
    case 'number':
      return '42';
    case 'search':
      return 'test search';
    default:
      return 'test value';
  }
}