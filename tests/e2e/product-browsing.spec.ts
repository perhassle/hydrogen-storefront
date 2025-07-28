import { test, expect } from '../fixtures/page-fixtures';
import { testUtils } from '../utils';

test.describe('Product Browsing and Viewing', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await page.context().clearCookies();
  });

  test('should display homepage with featured content', async ({ homePage }) => {
    await homePage.goto();
    
    // Verify page loads successfully
    expect(await homePage.isLoaded()).toBe(true);
    
    // Check for main navigation
    await expect(homePage.mainNavigation).toBeVisible();
    
    // Check for cart badge
    await expect(homePage.cartBadge).toBeVisible();
  });

  test('should navigate to product from homepage', async ({ homePage, productPage }) => {
    await homePage.goto();
    
    // Check if there are featured products
    const productCount = await homePage.productCards.count();
    
    if (productCount > 0) {
      // Click on first featured product
      await homePage.clickFeaturedProduct(0);
      
      // Verify we're on a product page
      expect(await productPage.isLoaded()).toBe(true);
      
      // Verify product information is displayed
      await expect(productPage.productTitle).toBeVisible();
      await expect(productPage.productPrice).toBeVisible();
    } else {
      console.log('No featured products found on homepage');
    }
  });

  test('should display product details correctly', async ({ productPage, page }) => {
    // Try to navigate to a known product or discover one
    await page.goto('/');
    
    // Look for any product links
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Verify product page elements
      expect(await productPage.isLoaded()).toBe(true);
      
      // Check essential product information
      await expect(productPage.productTitle).toBeVisible();
      await expect(productPage.productPrice).toBeVisible();
      
      // Check for product image
      await expect(productPage.productImage).toBeVisible();
      
      // Verify add to cart button is present
      await expect(productPage.addToCartButton).toBeVisible();
      
      // Get product info for validation
      const productInfo = await productPage.getProductInfo();
      expect(productInfo.title).toBeTruthy();
      expect(productInfo.price).toBeTruthy();
    } else {
      console.log('No product pages found to test');
    }
  });

  test('should handle product variants if available', async ({ productPage, page }) => {
    await page.goto('/');
    
    // Find a product with variants
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    for (const link of productLinks.slice(0, 3)) { // Check first 3 products
      await link.click();
      await page.waitForLoadState('networkidle');
      
      const variants = await productPage.getAvailableVariants();
      
      if (variants.length > 0) {
        console.log(`Found product with variants: ${variants.join(', ')}`);
        
        // Test variant selection
        for (const variant of variants.slice(0, 2)) { // Test first 2 variants
          await productPage.selectVariant(variant);
          await page.waitForTimeout(500);
          
          // Verify variant selection doesn't break the page
          expect(await productPage.isAddToCartEnabled()).toBe(true);
        }
        
        break; // Found a product with variants, stop searching
      }
      
      // Go back to homepage to try next product
      await page.goto('/');
    }
  });

  test('should show related products if available', async ({ productPage, page }) => {
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Check for related products section
      const relatedProductsVisible = await productPage.relatedProducts.isVisible();
      
      if (relatedProductsVisible) {
        const relatedCount = await productPage.relatedProductCards.count();
        console.log(`Found ${relatedCount} related products`);
        
        if (relatedCount > 0) {
          // Test clicking on related product
          await productPage.clickRelatedProduct(0);
          
          // Verify we navigated to another product
          expect(await productPage.isLoaded()).toBe(true);
        }
      }
    }
  });

  test('should handle product gallery if available', async ({ productPage, page }) => {
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Check if product has multiple images
      const imageCount = await productPage.galleryImages.count();
      
      if (imageCount > 1) {
        console.log(`Product has ${imageCount} images in gallery`);
        
        // Test viewing different images
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          await productPage.viewImage(i);
          await page.waitForTimeout(300);
        }
      }
    }
  });

  test('should handle product quantity controls', async ({ productPage, page }) => {
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Test quantity controls if available
      const quantityInputVisible = await productPage.quantityInput.isVisible();
      
      if (quantityInputVisible) {
        // Test setting quantity
        await productPage.setQuantity(3);
        expect(await productPage.getQuantity()).toBe(3);
        
        // Test increase/decrease buttons if available
        const increaseVisible = await productPage.quantityIncrease.isVisible();
        const decreaseVisible = await productPage.quantityDecrease.isVisible();
        
        if (increaseVisible) {
          await productPage.increaseQuantity();
          expect(await productPage.getQuantity()).toBeGreaterThan(3);
        }
        
        if (decreaseVisible) {
          await productPage.decreaseQuantity();
        }
      }
    }
  });

  test('should navigate through breadcrumbs if available', async ({ productPage, page }) => {
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Check for breadcrumbs
      const breadcrumbsVisible = await productPage.breadcrumbs.isVisible();
      
      if (breadcrumbsVisible) {
        const breadcrumbLinks = await productPage.breadcrumbs.locator('a').all();
        
        if (breadcrumbLinks.length > 0) {
          // Click on first breadcrumb (usually "Home" or collection)
          await breadcrumbLinks[0].click();
          await page.waitForLoadState('networkidle');
          
          // Verify navigation worked
          expect(page.url()).not.toContain('/products/');
        }
      }
    }
  });
});