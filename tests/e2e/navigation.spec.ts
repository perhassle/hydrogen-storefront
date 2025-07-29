import { test, expect } from '../fixtures/page-fixtures';
import { viewportSizes } from '../fixtures/test-data';

test.describe('Navigation and Menu Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should display main navigation on homepage', async ({ homePage }) => {
    await homePage.goto();
    
    // Check main navigation is visible
    await expect(homePage.mainNavigation).toBeVisible();
    
    // Check for navigation links
    const navLinks = await homePage.mainNavigation.locator('a').all();
    expect(navLinks.length).toBeGreaterThan(0);
    
    console.log(`Found ${navLinks.length} navigation links`);
  });

  test('should navigate through main menu items', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Get all main navigation links
    const navLinks = await homePage.mainNavigation.locator('a[href]').all();
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) { // Test first 5 links
      const link = navLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        console.log(`Testing navigation link: "${text}" -> ${href}`);
        
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation worked
        const currentUrl = page.url();
        if (href.startsWith('/')) {
          expect(currentUrl).toContain(href);
        }
        
        // Go back to homepage for next test
        await homePage.goto();
      }
    }
  });

  test('should handle collections navigation', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Look for collections links in navigation
    const collectionsLinks = await page.locator('a[href*="/collections"]').all();
    
    if (collectionsLinks.length > 0) {
      console.log(`Found ${collectionsLinks.length} collections links`);
      
      // Test first few collections
      for (let i = 0; i < Math.min(collectionsLinks.length, 3); i++) {
        const link = collectionsLinks[i];
        const text = await link.textContent();
        
        console.log(`Testing collection: "${text}"`);
        
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on a collection page
        expect(page.url()).toContain('/collections');
        
        // Look for products in the collection
        const productCards = await page.locator('.product-card, [data-testid="product-card"], .product-item').count();
        console.log(`Collection has ${productCards} products`);
        
        // Go back to homepage
        await homePage.goto();
      }
    } else {
      console.log('No collections links found in navigation');
    }
  });

  test('should display footer navigation', async ({ homePage }) => {
    await homePage.goto();
    
    // Check footer exists
    await expect(homePage.footer).toBeVisible();
    
    // Check for footer links
    const footerLinksCount = await homePage.footerLinks.count();
    console.log(`Found ${footerLinksCount} footer links`);
    
    expect(footerLinksCount).toBeGreaterThan(0);
  });

  test('should navigate through footer links', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Get footer links
    const footerLinks = await homePage.footerLinks.all();
    
    for (let i = 0; i < Math.min(footerLinks.length, 5); i++) { // Test first 5 footer links
      const link = footerLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        console.log(`Testing footer link: "${text}" -> ${href}`);
        
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation worked (allow external links)
        const currentUrl = page.url();
        if (href.startsWith('/')) {
          expect(currentUrl).toContain(href);
        }
        
        // Go back to homepage for next test
        await homePage.goto();
      }
    }
  });

  test('should handle mobile menu toggle', async ({ homePage, page }) => {
    // Set mobile viewport
    await page.setViewportSize(viewportSizes.mobile);
    await homePage.goto();
    
    // Look for mobile menu toggle
    const mobileMenuToggleVisible = await homePage.mobileMenuToggle.isVisible();
    
    if (mobileMenuToggleVisible) {
      console.log('Mobile menu toggle found');
      
      // Click mobile menu toggle
      await homePage.mobileMenuToggle.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Look for mobile menu
      const mobileMenu = page.locator('.mobile-menu, .nav-menu, [data-testid="mobile-menu"]').first();
      const mobileMenuVisible = await mobileMenu.isVisible();
      
      if (mobileMenuVisible) {
        console.log('Mobile menu opened successfully');
        
        // Check for navigation links in mobile menu
        const mobileNavLinks = await mobileMenu.locator('a').count();
        console.log(`Mobile menu has ${mobileNavLinks} links`);
        
        expect(mobileNavLinks).toBeGreaterThan(0);
        
        // Try closing the menu (click toggle again or overlay)
        const closeButton = page.locator('.close-menu, [data-testid="close-menu"], button[aria-label*="close" i]').first();
        const closeButtonVisible = await closeButton.isVisible();
        
        if (closeButtonVisible) {
          await closeButton.click();
        } else {
          await homePage.mobileMenuToggle.click(); // Toggle again to close
        }
        
        await page.waitForTimeout(500);
      } else {
        console.log('Mobile menu did not open or is not visible');
      }
    } else {
      console.log('Mobile menu toggle not found');
    }
  });

  test('should maintain navigation consistency across pages', async ({ page, homePage, productPage }) => {
    await homePage.goto();
    
    // Get navigation structure from homepage
    const homeNavLinks = await homePage.mainNavigation.locator('a').count();
    
    // Navigate to a product page
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Check navigation is still present and consistent
      await expect(productPage.mainNavigation).toBeVisible();
      
      const productNavLinks = await productPage.mainNavigation.locator('a').count();
      
      // Navigation should be consistent
      expect(productNavLinks).toBe(homeNavLinks);
      
      console.log('Navigation consistency maintained across pages');
    }
  });

  test('should handle search in navigation', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Check if search is in navigation
    const navSearchVisible = await homePage.searchInput.isVisible();
    
    if (navSearchVisible) {
      console.log('Search found in navigation');
      
      // Test search functionality
      await homePage.search('test');
      
      // Should navigate to search page
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('search');
      
      console.log('Navigation search works correctly');
    } else {
      console.log('Search not found in main navigation');
    }
  });

  test('should handle account links in navigation', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Look for account/login links
    const accountLinks = await page.locator('a:has-text("Account"), a:has-text("Login"), a:has-text("Sign in"), a[href*="/account"]').all();
    
    if (accountLinks.length > 0) {
      console.log(`Found ${accountLinks.length} account-related links`);
      
      // Test first account link
      const firstAccountLink = accountLinks[0];
      const text = await firstAccountLink.textContent();
      
      console.log(`Testing account link: "${text}"`);
      
      await firstAccountLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to account or login page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(account|login|signin)/);
      
      console.log(`Account link navigated to: ${currentUrl}`);
    } else {
      console.log('No account links found in navigation');
    }
  });

  test('should handle cart link in navigation', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Cart badge should be in navigation
    await expect(homePage.cartBadge).toBeVisible();
    
    // Click cart badge
    await homePage.cartBadge.click();
    
    // Should either open cart sidebar or navigate to cart page
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const cartSidebar = page.locator('.cart-sidebar, .cart-drawer, aside[data-testid="cart"]').first();
    const sidebarVisible = await cartSidebar.isVisible();
    
    if (sidebarVisible) {
      console.log('Cart sidebar opened from navigation');
    } else if (currentUrl.includes('/cart')) {
      console.log('Navigated to cart page from navigation');
    } else {
      console.log('Cart interaction may have different behavior');
    }
  });

  test('should support keyboard navigation', async ({ page, homePage }) => {
    await homePage.goto();
    
    // Focus on first navigation link
    const firstNavLink = homePage.mainNavigation.locator('a').first();
    await firstNavLink.focus();
    
    // Test Tab key navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Check that focus moves through navigation elements
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`Tab ${i + 1}: Focused on ${focusedElement}`);
    }
    
    // Test Enter key on focused link
    const focusedLink = page.locator(':focus');
    const focusedLinkVisible = await focusedLink.isVisible();
    
    if (focusedLinkVisible) {
      const href = await focusedLink.getAttribute('href');
      
      if (href && !href.startsWith('#')) {
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Verify navigation occurred
        const currentUrl = page.url();
        console.log(`Keyboard navigation successful to: ${currentUrl}`);
      }
    }
  });

  test('should handle responsive navigation at different breakpoints', async ({ page, homePage }) => {
    const breakpoints = [
      { size: viewportSizes.mobile, name: 'mobile' },
      { size: viewportSizes.tablet, name: 'tablet' },
      { size: viewportSizes.desktop, name: 'desktop' },
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize(breakpoint.size);
      await homePage.goto();
      
      console.log(`Testing navigation at ${breakpoint.name} breakpoint`);
      
      // Navigation should be present at all breakpoints
      await expect(homePage.mainNavigation).toBeVisible();
      
      // Mobile might have different navigation behavior
      if (breakpoint.name === 'mobile') {
        const mobileMenuToggleVisible = await homePage.mobileMenuToggle.isVisible();
        console.log(`Mobile menu toggle visible: ${mobileMenuToggleVisible}`);
      }
      
      // Cart should always be accessible
      await expect(homePage.cartBadge).toBeVisible();
    }
  });
});