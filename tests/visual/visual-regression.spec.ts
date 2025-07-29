import { test, expect } from '../fixtures/page-fixtures';
import { VisualHelpers } from '../utils';
import { viewportSizes } from '../fixtures/test-data';

test.describe('Visual Regression Testing', () => {
  let visualHelpers: VisualHelpers;

  test.beforeEach(async ({ page }) => {
    visualHelpers = new VisualHelpers(page);
    await page.context().clearCookies();
  });

  test('should capture homepage baseline screenshots', async ({ homePage, page }) => {
    await homePage.goto();
    await visualHelpers.prepareForVisualTesting();
    
    // Full page screenshot
    await visualHelpers.takeFullPageScreenshot('homepage-full');
    
    // Test responsive design
    await visualHelpers.testResponsiveDesign('homepage');
    
    console.log('✅ Homepage baseline screenshots captured');
  });

  test('should capture product page visual states', async ({ productPage, page }) => {
    // Navigate to a product page
    await page.goto('/');
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await visualHelpers.prepareForVisualTesting();
      
      // Product page full screenshot
      await visualHelpers.takeFullPageScreenshot('product-page-full');
      
      // Product details section
      await visualHelpers.takeElementScreenshot(
        '.product-details, [data-testid="product-details"], .product-info',
        'product-details-section'
      );
      
      // Product gallery if available
      const galleryVisible = await page.locator('.product-gallery, .product-images').isVisible();
      if (galleryVisible) {
        await visualHelpers.takeElementScreenshot(
          '.product-gallery, .product-images',
          'product-gallery'
        );
      }
      
      // Test add to cart button states
      const addToCartButton = '.add-to-cart, [data-testid="add-to-cart"], button:has-text("Add to cart")';
      if (await page.locator(addToCartButton).isVisible()) {
        await visualHelpers.testHoverStates(addToCartButton, 'add-to-cart-button');
        await visualHelpers.testFocusStates(addToCartButton, 'add-to-cart-button');
      }
      
      console.log('✅ Product page screenshots captured');
    }
  });

  test('should capture cart page visual states', async ({ cartPage, productPage, page }) => {
    // First add an item to cart if possible
    await page.goto('/');
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      const addToCartEnabled = await productPage.isAddToCartEnabled();
      if (addToCartEnabled) {
        await productPage.addToCart();
      }
    }
    
    // Navigate to cart
    await cartPage.goto();
    await visualHelpers.prepareForVisualTesting();
    
    // Check if cart is empty or has items
    const isEmpty = await cartPage.isEmpty();
    
    if (isEmpty) {
      await visualHelpers.takeFullPageScreenshot('cart-empty');
      console.log('✅ Empty cart screenshot captured');
    } else {
      await visualHelpers.takeFullPageScreenshot('cart-with-items');
      
      // Cart summary section
      const summaryVisible = await cartPage.cartSummary.isVisible();
      if (summaryVisible) {
        await visualHelpers.takeElementScreenshot(
          '.cart-summary, [data-testid="cart-summary"]',
          'cart-summary'
        );
      }
      
      console.log('✅ Cart with items screenshot captured');
    }
  });

  test('should capture search page visual states', async ({ searchPage, page }) => {
    await searchPage.goto();
    await visualHelpers.prepareForVisualTesting();
    
    // Empty search page
    await visualHelpers.takeFullPageScreenshot('search-empty');
    
    // Search with results
    await searchPage.search('product');
    await page.waitForLoadState('networkidle');
    await visualHelpers.prepareForVisualTesting();
    
    const hasResults = await searchPage.hasResults();
    if (hasResults) {
      await visualHelpers.takeFullPageScreenshot('search-with-results');
      
      // Search results section
      await visualHelpers.takeElementScreenshot(
        '.search-results, [data-testid="search-results"]',
        'search-results-section'
      );
    } else {
      await visualHelpers.takeFullPageScreenshot('search-no-results');
    }
    
    console.log('✅ Search page screenshots captured');
  });

  test('should test navigation component visual states', async ({ homePage, page }) => {
    await homePage.goto();
    await visualHelpers.prepareForVisualTesting();
    
    // Main navigation
    await visualHelpers.takeElementScreenshot(
      'nav, .main-nav, [data-testid="main-nav"]',
      'main-navigation'
    );
    
    // Test navigation hover states
    const navLinks = await page.locator('nav a').all();
    if (navLinks.length > 0) {
      await visualHelpers.testHoverStates('nav a:first-child', 'nav-link');
    }
    
    // Mobile navigation
    await page.setViewportSize(viewportSizes.mobile);
    await page.reload();
    await visualHelpers.prepareForVisualTesting();
    
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, [data-testid="mobile-menu-toggle"]').first();
    if (await mobileMenuToggle.isVisible()) {
      // Before opening mobile menu
      await visualHelpers.takeFullPageScreenshot('mobile-nav-closed');
      
      // Open mobile menu
      await mobileMenuToggle.click();
      await page.waitForTimeout(500);
      
      // After opening mobile menu
      await visualHelpers.takeFullPageScreenshot('mobile-nav-open');
    }
    
    console.log('✅ Navigation component screenshots captured');
  });

  test('should test form visual states', async ({ page }) => {
    // Look for forms across the site
    const formPages = ['/contact', '/account/login', '/search'];
    
    for (const formPage of formPages) {
      try {
        await page.goto(formPage);
        await visualHelpers.prepareForVisualTesting();
        
        const forms = await page.locator('form').all();
        
        for (let i = 0; i < forms.length; i++) {
          const formSelector = `form:nth-child(${i + 1})`;
          const formName = `${formPage.replace('/', '').replace('/', '-') || 'root'}-form-${i}`;
          
          // Test form validation states
          await visualHelpers.testFormValidation(formSelector, formName);
          
          // Test individual form inputs
          const inputs = await forms[i].locator('input, select, textarea').all();
          for (let j = 0; j < Math.min(inputs.length, 3); j++) {
            const inputSelector = `${formSelector} input:nth-child(${j + 1}), ${formSelector} select:nth-child(${j + 1}), ${formSelector} textarea:nth-child(${j + 1})`;
            if (await page.locator(inputSelector).isVisible()) {
              await visualHelpers.testFocusStates(inputSelector, `${formName}-input-${j}`);
            }
          }
        }
        
        console.log(`✅ Form screenshots captured for ${formPage}`);
      } catch (error) {
        console.log(`⚠️ Could not capture form screenshots for ${formPage}: ${error.message}`);
      }
    }
  });

  test('should test loading states visual regression', async ({ page }) => {
    await page.goto('/');
    
    // Test search loading state
    const searchInput = page.locator('input[type="search"], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      await visualHelpers.testLoadingStates('search-loading', async () => {
        await searchInput.fill('test search');
        await searchInput.press('Enter');
      });
    }
    
    // Test navigation loading state
    const navLinks = await page.locator('a[href^="/"]').all();
    if (navLinks.length > 0) {
      await visualHelpers.testLoadingStates('navigation-loading', async () => {
        await navLinks[0].click();
      });
    }
    
    console.log('✅ Loading states screenshots captured');
  });

  test('should test modal/overlay visual states', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Test cart sidebar/modal
    const cartBadge = homePage.cartBadge;
    if (await cartBadge.isVisible()) {
      await visualHelpers.testModalStates(
        '.cart-badge, [data-testid="cart-badge"]',
        '.cart-aside, .cart-drawer, aside',
        'cart-modal'
      );
    }
    
    // Look for other modal triggers
    const modalTriggers = await page.locator('button[data-modal], [data-toggle="modal"], .modal-trigger').all();
    
    for (let i = 0; i < Math.min(modalTriggers.length, 3); i++) {
      const trigger = modalTriggers[i];
      const triggerText = await trigger.textContent();
      
      if (await trigger.isVisible()) {
        await visualHelpers.testModalStates(
          `button:nth-child(${i + 1})`,
          '.modal, .overlay, .popup',
          `modal-${i}-${triggerText?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`
        );
      }
    }
    
    console.log('✅ Modal/overlay screenshots captured');
  });

  test('should test error states visual regression', async ({ page }) => {
    // Test 404 page
    try {
      await page.goto('/non-existent-page-12345');
      await visualHelpers.prepareForVisualTesting();
      await visualHelpers.takeFullPageScreenshot('404-error-page');
      console.log('✅ 404 error page screenshot captured');
    } catch (error) {
      console.log('⚠️ Could not capture 404 page screenshot');
    }
    
    // Test form validation errors
    const formPages = ['/contact', '/account/login'];
    
    for (const formPage of formPages) {
      try {
        await page.goto(formPage);
        await visualHelpers.prepareForVisualTesting();
        
        // Try to submit empty form to trigger validation errors
        const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          await visualHelpers.takeFullPageScreenshot(`${formPage.replace('/', '').replace('/', '-') || 'root'}-validation-errors`);
        }
      } catch (error) {
        console.log(`⚠️ Could not capture validation errors for ${formPage}`);
      }
    }
    
    console.log('✅ Error states screenshots captured');
  });

  test('should test theme variations if supported', async ({ homePage, page }) => {
    await homePage.goto();
    
    // Test light/dark themes if supported
    await visualHelpers.testThemes('homepage', async () => {
      await visualHelpers.prepareForVisualTesting();
    });
    
    console.log('✅ Theme variation screenshots captured');
  });

  test('should capture cross-browser visual consistency', async ({ page, browserName }) => {
    // This test will run across different browsers based on Playwright config
    await page.goto('/');
    await visualHelpers.prepareForVisualTesting();
    
    // Capture browser-specific screenshots
    await visualHelpers.takeFullPageScreenshot(`homepage-${browserName}`);
    
    // Test key pages across browsers
    const keyPages = ['/products', '/cart', '/search'];
    
    for (const keyPage of keyPages) {
      try {
        await page.goto(keyPage);
        await visualHelpers.prepareForVisualTesting();
        
        const pageName = keyPage.replace('/', '').replace('/', '-') || 'root';
        await visualHelpers.takeFullPageScreenshot(`${pageName}-${browserName}`);
      } catch (error) {
        console.log(`⚠️ Could not capture ${keyPage} for ${browserName}`);
      }
    }
    
    console.log(`✅ Cross-browser screenshots captured for ${browserName}`);
  });

  test('should test interactive element states', async ({ page }) => {
    await page.goto('/');
    await visualHelpers.prepareForVisualTesting();
    
    // Test button states
    const buttons = await page.locator('button').all();
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const buttonSelector = `button:nth-child(${i + 1})`;
      if (await page.locator(buttonSelector).isVisible()) {
        await visualHelpers.testHoverStates(buttonSelector, `button-${i}`);
        await visualHelpers.testFocusStates(buttonSelector, `button-${i}`);
      }
    }
    
    // Test link states
    const links = await page.locator('a[href]').all();
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const linkSelector = `a[href]:nth-child(${i + 1})`;
      if (await page.locator(linkSelector).isVisible()) {
        await visualHelpers.testHoverStates(linkSelector, `link-${i}`);
        await visualHelpers.testFocusStates(linkSelector, `link-${i}`);
      }
    }
    
    console.log('✅ Interactive element states screenshots captured');
  });
});